import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    products: [
        {
            id: { type: String, required: true },
            title: {
                shortTitle: String,
                longTitle: String
            },
            price: {
                mrp: Number,
                cost: Number,
                discount: String
            },
            url: String,
            quantity: { type: Number, default: 1 }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    orderStatus: {
        type: String,
        enum: ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Group Buy Pending', 'Group Buy Cancelled'],
        default: 'Ordered'
    },
    statusTimeline: [
        {
            status: { type: String },
            date: { type: Date, default: Date.now },
            description: { type: String }
        }
    ]
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
