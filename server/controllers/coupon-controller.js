import Coupon from '../model/coupon-schema.js';

export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!coupon) {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }
        
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }
        
        if (new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }
        
        if (orderAmount < coupon.minOrderValue) {
            return res.status(400).json({ message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` });
        }
        
        // Calculate discount
        let discount = (orderAmount * coupon.discountPercentage) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }
        
        res.status(200).json({
            message: 'Coupon applied successfully',
            discount: Math.round(discount),
            coupon
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(200).json({ message: 'Coupon created', coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
