import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay instance (initialized lazily)
let razorpay;

// Step 1 - Create Razorpay Order (called from frontend before opening checkout)
export const createRazorpayOrder = async (req, res) => {
    try {
        if (!razorpay) {
            razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
        }
        const { amount } = req.body; // amount in rupees

        const options = {
            amount: amount * 100,        // Razorpay works in paise (1 rupee = 100 paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID   // frontend ko key chahiye checkout ke liye
        });

    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return res.status(500).json({ message: 'Payment initiation failed' });
    }
};

// Step 2 - Verify Payment Signature (after user pays)
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Signature verify karo - tamper check
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified ✅
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id
            });
        } else {
            // Signature match nahi - payment tampered ❌
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - signature mismatch'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ message: 'Payment verification error' });
    }
};