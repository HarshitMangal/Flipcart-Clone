import Wishlist from '../model/wishlist-schema.js';
import Product from '../model/product-schema.js';

export const toggleWishlist = async (req, res) => {
    try {
        const { userId: username, productId } = req.body; // frontend sends userId but it's actually username
        
        let wishlist = await Wishlist.findOne({ username });
        
        if (!wishlist) {
            wishlist = new Wishlist({ username, products: [{ productId }] });
            await wishlist.save();
            return res.status(200).json({ message: 'Product added to wishlist', wishlist });
        }
        
        const productIndex = wishlist.products.findIndex(p => p.productId === productId);
        
        if (productIndex > -1) {
            // Remove if already exists
            wishlist.products.splice(productIndex, 1);
            await wishlist.save();
            return res.status(200).json({ message: 'Product removed from wishlist', wishlist });
        } else {
            // Add if not exists
            wishlist.products.push({ productId });
            await wishlist.save();
            return res.status(200).json({ message: 'Product added to wishlist', wishlist });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const { userId: username } = req.params;
        const wishlist = await Wishlist.findOne({ username });
        
        if (!wishlist) {
            return res.status(200).json([]);
        }
        
        // Fetch full product details for each productId
        const productIds = wishlist.products.map(p => p.productId);
        const products = await Product.find({ id: { $in: productIds } });
        
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
