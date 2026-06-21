import Review from "../model/review-schema.js";

// 1. Add Product Review (Product page se user jab review and stars submit karega)
export const addReview = async (req, res) => {
    try {
        const { id } = req.params; // Product custom ID
        const { username, rating, title, comment } = req.body;

        if (!username || !rating || !title || !comment) {
            return res.status(400).json({ message: "All fields (rating, title, comment) are required." });
        }

        // New review create aur save karenge
        const newReview = new Review({
            productId: id,
            username,
            rating: Number(rating),
            title,
            comment
        });

        await newReview.save();

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully!",
            review: newReview
        });

    } catch (error) {
        console.error("Error adding product review:", error);
        return res.status(500).json({ message: "Failed to submit review", error: error.message });
    }
};

// 2. Fetch Product Reviews (Details page par load karne ke liye)
export const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params; // Product custom ID

        // Is product ke saare reviews query karenge (sorted by latest date first)
        const reviews = await Review.find({ productId: id }).sort({ date: -1 });
        return res.status(200).json(reviews);

    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
    }
};
