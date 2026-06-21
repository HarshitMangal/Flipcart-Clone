import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    products: [{
        productId: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
