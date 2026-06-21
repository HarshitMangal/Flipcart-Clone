import mongoose from "mongoose";

// Price Alert schema definition (User jab subscribe karega tab data yahan save hoga)
const priceAlertSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

const PriceAlert = mongoose.model("PriceAlert", priceAlertSchema);
export default PriceAlert;
