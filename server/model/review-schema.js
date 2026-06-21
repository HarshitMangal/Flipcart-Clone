import mongoose from "mongoose";

// Review Schema definition (Har product ke reviews store karne ke liye)
const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true // index lagane se product wise reviews query faster hoti hai
    },
    username: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
