import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function() { return !this.googleId; } // Not required if using Google Login
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    googleId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default User;