import mongoose from 'mongoose';

const groupBuySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true
    },
    creator: {
        type: String,
        required: true
    },
    members: [{
        username: {
            type: String,
            required: true
        },
        orderId: {
            type: String,
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    targetMembers: {
        type: Number,
        default: 3 // Set to 3 for easier testing/demo
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
}, { timestamps: true });

const GroupBuy = mongoose.model('GroupBuy', groupBuySchema);

export default GroupBuy;
