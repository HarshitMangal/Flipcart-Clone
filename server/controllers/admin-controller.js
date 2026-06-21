import Order from "../model/order-schema.js";
import Product from "../model/product-schema.js";
import PriceAlert from "../model/price-alert-schema.js";
import Notification from "../model/notification-schema.js";

// 1. Get All Orders (Puri database ke saare orders download karne ke liye)
export const getAllOrders = async (req, res) => {
    try {
        // Saare orders ko database se nikalenge aur latest orders ko sabse pehle dikhayenge (sort: orderDate desc)
        const orders = await Order.find().sort({ orderDate: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders for admin:", error);
        return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

// 2. Update Order Status (Order status change karne ke liye: Ordered -> Shipped -> Delivered)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Order ki MongoDB ID
        const { orderStatus } = req.body; // Naya status

        if (!orderStatus) {
            return res.status(400).json({ message: "Order status is required" });
        }

        // Database me order ko update karenge
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true } // true matlab update hone ke baad jo naya record bana hai wo return karega
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

// 3. Add New Product (Database me naya product add karne ke liye)
export const addProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Custom product ID generate karenge agar nahi di gayi hai (jaise Flipkart me hota hai)
        if (!productData.id) {
            productData.id = 'prod_' + Math.random().toString(36).substring(2, 9);
        }

        // Check karenge ki is ID ka product pehle se toh nahi hai
        const exist = await Product.findOne({ id: productData.id });
        if (exist) {
            return res.status(400).json({ message: "Product with this ID already exists" });
        }

        // Naya product create aur save karenge
        const newProduct = new Product(productData);
        await newProduct.save();

        return res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Failed to add product", error: error.message });
    }
};

// 4. Update Product (Product ki details edit karne ke liye, jaise price ya stock count)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // Custom product ID (like product1, dummy_2)
        const updatedData = req.body;

        // Pehle old product fetch karenge taaki price decrease check ho sake
        const oldProduct = await Product.findOne({ id: id });
        if (!oldProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        const oldPrice = oldProduct.price?.cost;

        // Database me custom ID match karke update karenge
        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { $set: updatedData },
            { new: true }
        );

        const newPrice = updatedProduct.price?.cost;

        // Agar new price set hai aur price decrease hua hai, toh alerts trigger karenge
        if (newPrice && oldPrice && newPrice < oldPrice) {
            const alerts = await PriceAlert.find({ productId: id });

            for (const alert of alerts) {
                // Agar updated price user ke originalPrice se kam hai
                if (newPrice < alert.originalPrice) {
                    const notifyMessage = `Price Drop Alert! The price of "${updatedProduct.title.shortTitle}" has dropped from ₹${alert.originalPrice} to ₹${newPrice}!`;
                    
                    const notification = new Notification({
                        username: alert.username,
                        message: notifyMessage,
                        isRead: false
                    });
                    await notification.save();

                    // Alert notify hone ke baad ise clean up kar denge (one-time alert)
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

// 5. Delete Product (Product ko catalog se delete karne ke liye)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params; // Custom product ID

        const deletedProduct = await Product.findOneAndDelete({ id: id });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product deleted successfully from inventory",
            product: deletedProduct
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};
