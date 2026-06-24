aimport Order from "../model/order-schema.js";
import Product from "../model/product-schema.js";
import PriceAlert from "../model/price-alert-schema.js";
import Notification from "../model/notification-schema.js";
import { clearProductCache } from "../config/redis.js";

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders for admin:", error);
        return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus) {
            return res.status(400).json({ message: "Order status is required" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Failed to update order status", error: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const productData = req.body;

        if (!productData.id) {
            productData.id = 'prod_' + Math.random().toString(36).substring(2, 9);
        }

        const exist = await Product.findOne({ id: productData.id });
        if (exist) {
            return res.status(400).json({ message: "Product with this ID already exists" });
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        await clearProductCache();

        return res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Failed to add product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const oldProduct = await Product.findOne({ id: id });
        if (!oldProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        const oldPrice = oldProduct.price?.cost;

        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { $set: updatedData },
            { new: true }
        );

        await clearProductCache(id);

        const newPrice = updatedProduct.price?.cost;

        if (newPrice && oldPrice && newPrice < oldPrice) {
            const alerts = await PriceAlert.find({ productId: id });

            for (const alert of alerts) {
                if (newPrice < alert.originalPrice) {
                    const notifyMessage = `Price Drop Alert! The price of "${updatedProduct.title.shortTitle}" has dropped from ₹${alert.originalPrice} to ₹${newPrice}!`;
                    
                    const notification = new Notification({
                        username: alert.username,
                        message: notifyMessage,
                        isRead: false
                    });
                    await notification.save();

                    await PriceAlert.findByIdAndDelete(alert._id);
                }
            }
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findOneAndDelete({ id: id });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        await clearProductCache(id);

        return res.status(200).json({
            message: "Product deleted successfully from inventory",
            product: deletedProduct
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};
