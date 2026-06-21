import Address from '../model/address-schema.js';

export const addAddress = async (req, res) => {
    try {
        const address = new Address(req.body);
        if (address.isDefault) {
            await Address.updateMany({ userId: address.userId }, { isDefault: false });
        }
        await address.save();
        res.status(200).json({ message: 'Address added successfully', address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await Address.find({ userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (updates.isDefault) {
            const addressToUpdate = await Address.findById(id);
            if (addressToUpdate) {
                await Address.updateMany({ userId: addressToUpdate.userId }, { isDefault: false });
            }
        }
        
        const updatedAddress = await Address.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ message: 'Address updated', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.findByIdAndDelete(id);
        res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
