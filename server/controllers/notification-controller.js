import PriceAlert from "../model/price-alert-schema.js";
import Notification from "../model/notification-schema.js";

// 1. Subscribe to Price Drop Alert (User jab button par click karega toh alert register hoga)
export const subscribeToPriceDrop = async (req, res) => {
    try {
        const { productId, username, originalPrice } = req.body;

        if (!productId || !username || !originalPrice) {
            return res.status(400).json({ message: "Invalid subscription details. Missing fields." });
        }

        // Check karenge ki user ne is product ke liye pehle se alert toh nahi lagaya hai
        const existingAlert = await PriceAlert.findOne({ productId, username });
        if (existingAlert) {
            return res.status(200).json({ 
                success: true, 
                message: "You are already subscribed to price drops for this product!" 
            });
        }

        // Naya price drop alert record DB me create karenge
        const newAlert = new PriceAlert({
            productId,
            username,
            originalPrice: Number(originalPrice)
        });

        await newAlert.save();

        return res.status(201).json({
            success: true,
            message: "Price drop alert registered successfully! We will notify you when the price decreases."
        });

    } catch (error) {
        console.error("Error subscribing to price drop alert:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 2. Fetch User Notifications (Header me active alerts display karne ke liye)
export const getUserNotifications = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: "Username is required to fetch alerts." });
        }

        // DB se user ke saare notifications nikalenge, latest warnings top par honge
        const alerts = await Notification.find({ username }).sort({ date: -1 });
        return res.status(200).json(alerts);

    } catch (error) {
        console.error("Error fetching user alerts:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 3. Mark Notifications as Read (Badge notification count 0 karne ke liye)
export const markNotificationsRead = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required." });
        }

        // Saare read markers ko update karke status 'true' kar denge
        await Notification.updateMany({ username, isRead: false }, { $set: { isRead: true } });

        return res.status(200).json({ 
            success: true, 
            message: "All alerts marked as read." 
        });

    } catch (error) {
        console.error("Error marking alerts read:", error);
        return res.status(500).json({ message: error.message });
    }
};
