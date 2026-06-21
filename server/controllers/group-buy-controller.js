import GroupBuy from '../model/group-buy-schema.js';
import Order from '../model/order-schema.js';
import Product from '../model/product-schema.js';

export const createGroupBuy = async (req, res) => {
    try {
        const { productId, username, orderId, targetMembers = 3 } = req.body;

        if (!productId || !username || !orderId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newGroup = new GroupBuy({
            productId,
            creator: username,
            members: [{ username, orderId }],
            targetMembers
        });

        await newGroup.save();

        // Update the order status to 'Group Buy Pending'
        await Order.findByIdAndUpdate(orderId, {
            orderStatus: 'Group Buy Pending',
            $push: {
                statusTimeline: {
                    status: 'Group Buy Pending',
                    description: `Group Buy started by ${username}. Waiting for other members.`
                }
            }
        });

        res.status(201).json({ message: 'Group Buy started successfully', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const joinGroupBuy = async (req, res) => {
    try {
        const { groupId, username, orderId } = req.body;

        if (!groupId || !username || !orderId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const group = await GroupBuy.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group buy not found' });
        }

        if (group.status !== 'active') {
            return res.status(400).json({ message: 'This group buy is no longer active' });
        }

        if (new Date() > new Date(group.expiresAt)) {
            group.status = 'expired';
            await group.save();
            return res.status(400).json({ message: 'This group buy has expired' });
        }

        // Check if user is already a member
        const isMember = group.members.some(m => m.username === username);
        if (isMember) {
            return res.status(400).json({ message: 'You have already joined this group buy' });
        }

        // Add user as member
        group.members.push({ username, orderId });

        // Update this user's order to 'Group Buy Pending'
        await Order.findByIdAndUpdate(orderId, {
            orderStatus: 'Group Buy Pending',
            $push: {
                statusTimeline: {
                    status: 'Group Buy Pending',
                    description: `Joined the group buy team.`
                }
            }
        });

        // Check if target reached
        if (group.members.length >= group.targetMembers) {
            group.status = 'completed';

            // Complete all orders in the group
            const orderIds = group.members.map(m => m.orderId);
            await Order.updateMany(
                { _id: { $in: orderIds } },
                {
                    orderStatus: 'Ordered',
                    $push: {
                        statusTimeline: {
                            status: 'Ordered',
                            description: 'Group Buy successful! Order is being processed.'
                        }
                    }
                }
            );
        }

        await group.save();

        res.status(200).json({ message: 'Joined group buy successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveGroupBuys = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Find active and not expired groups
        const groups = await GroupBuy.find({
            productId,
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGroupBuyById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await GroupBuy.findById(id);

        if (!group) {
            return res.status(404).json({ message: 'Group buy not found' });
        }

        // Check expiry and update if needed
        if (group.status === 'active' && new Date() > new Date(group.expiresAt)) {
            group.status = 'expired';
            await group.save();
        }

        // Fetch product info to show on share page
        const product = await Product.findOne({ id: group.productId });

        res.status(200).json({ group, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
