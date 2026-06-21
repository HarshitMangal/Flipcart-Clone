import express from 'express';
const router = express.Router();
import { userSignup, userLogin, sendOtp, verifyOtp, googleLogin, getUserProfile, updateUserProfile, becomeSeller } from '../controllers/user-controller.js';
import { getProducts, getProductById, importProducts, getSimilarProducts } from '../controllers/product-controllers.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/payment-controller.js';
import { createOrder, getOrders } from '../controllers/order-controller.js';
import { chatWithAI, translateReview } from '../controllers/ai-controller.js';
import { getAllOrders, updateOrderStatus, addProduct, updateProduct, deleteProduct } from '../controllers/admin-controller.js';
import { subscribeToPriceDrop, getUserNotifications, markNotificationsRead } from '../controllers/notification-controller.js';
import { addReview, getProductReviews } from '../controllers/review-controller.js';
import { toggleWishlist, getWishlist } from '../controllers/wishlist-controller.js';
import { addAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/address-controller.js';
import { validateCoupon, createCoupon } from '../controllers/coupon-controller.js';
import { createGroupBuy, joinGroupBuy, getActiveGroupBuys, getGroupBuyById } from '../controllers/group-buy-controller.js';

// Auth routes
router.post('/signup', userSignup);
router.post('/login', userLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/google-login', googleLogin);
router.get('/profile/:username', getUserProfile);
router.put('/profile/update', updateUserProfile);
router.post('/user/become-seller', becomeSeller);
router.post('/logout-all', async (req, res) => {
    try {
        const { username } = req.body;
        console.log(`User ${username} logged out from all devices`);
        res.status(200).json({ success: true, message: "Logged out from all devices successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Product routes
router.get('/products', getProducts);
router.get('/products/import', importProducts);
router.get('/products/:id', getProductById);
router.get('/products/:id/similar', getSimilarProducts);

import defaultData from '../default.js';
router.get('/products/reset', async (req, res) => {
    try {
        await defaultData();
        res.status(200).json({ success: true, message: "Default Flipkart products restored successfully!" });
    } catch (error) {
        console.error("Error resetting products:", error);
        res.status(500).json({ message: error.message });
    }
});

// Razorpay Payment routes
router.post('/payment/create', createRazorpayOrder);
router.post('/payment/verify', verifyPayment);

// Order routes
router.post('/order/create', createOrder);
router.get('/orders/:username', getOrders);

// AI Chat route
router.post('/chat', chatWithAI);

// Admin Routes (New features)
router.get('/admin/orders', getAllOrders);
router.put('/admin/orders/:id', updateOrderStatus);
router.post('/admin/products', addProduct);
router.put('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);

// Notification & Alert Routes
router.post('/alerts/subscribe', subscribeToPriceDrop);
router.get('/notifications/:username', getUserNotifications);
router.post('/notifications/read', markNotificationsRead);

// Review Routes
router.post('/products/:id/review', addReview);
router.get('/products/:id/reviews', getProductReviews);

// Translation Route
router.post('/translate', translateReview);

// Wishlist Routes
router.post('/wishlist/toggle', toggleWishlist);
router.get('/wishlist/:userId', getWishlist);

// Address Routes
router.post('/address/add', addAddress);
router.get('/address/:userId', getAddresses);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

// Coupon Routes
router.post('/coupon/validate', validateCoupon);
router.post('/coupon/create', createCoupon);

// Group Buy Routes
router.post('/group-buy/create', createGroupBuy);
router.post('/group-buy/join', joinGroupBuy);
router.get('/group-buy/active/:productId', getActiveGroupBuys);
router.get('/group-buy/:id', getGroupBuyById);

export default router;