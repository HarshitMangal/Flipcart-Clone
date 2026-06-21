import mongoose from "mongoose";

// Notification schema definition (Triggred price drop alerts yahan store honge aur user ko dashboard par dikhenge)
const notificationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
