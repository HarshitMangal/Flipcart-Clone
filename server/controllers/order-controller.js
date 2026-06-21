import Order from "../model/order-schema.js";
import Product from "../model/product-schema.js";

export const createOrder = async (req, res) => {
    try {
        const { username, products, totalAmount } = req.body;

        if (!username || !products || products.length === 0 || !totalAmount) {
            return res.status(400).json({ message: "Invalid order details" });
        }

        // 1. Verify stock levels for all products
        for (const item of products) {
            const dbProduct = await Product.findOne({ id: item.id });
            if (!dbProduct) {
                return res.status(404).json({ message: `Product ${item.id} not found` });
            }
            if (dbProduct.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Sorry, "${dbProduct.title.shortTitle}" is out of stock or does not have enough inventory (Available: ${dbProduct.quantity})` 
                });
            }
        }

        // 2. Decrement stock levels
        for (const item of products) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { quantity: -item.quantity } }
            );
        }

        // 3. Create the order log
        const newOrder = new Order({
            username,
            products,
            totalAmount,
            orderStatus: 'Ordered'
        });

        await newOrder.save();

        return res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        const orders = await Order.find({ username }).sort({ orderDate: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting orders:", error);
        return res.status(500).json({ message: error.message });
    }
};
