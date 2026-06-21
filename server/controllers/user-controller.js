import User from "../model/user-schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/email-service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || "flipcart_jwt_secret";

export const userSignup = async (req, res) => {
    try {
        console.log("req.body =", req.body);

        const { username, email, password } = req.body;

        const existUsername = await User.findOne({ username });
        if (existUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Salt and hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            ...req.body,
            password: hashedPassword
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Signup successful",
            data: {
                username: newUser.username,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                token
            }
        });
    } catch (error) {
        console.error("Error while signing up user", error);
        return res.status(500).json({
            message: error.message
        });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes
        await user.save();

        const isSent = await sendOTP(email, otp);
        if (isSent) {
            res.status(200).json({ message: "OTP sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (new Date() > new Date(user.otpExpires)) return res.status(400).json({ message: "OTP expired" });
        
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = new User({
                firstname: payload.given_name,
                lastname: payload.family_name || ' ',
                email: payload.email,
                username: payload.email.split('@')[0],
                googleId: payload.sub,
                isVerified: true
            });
            await user.save();
        }
        
        const jwtToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(200).json({
            message: "Google Login successful",
            data: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                token: jwtToken
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Login successful",
            data: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                token
            }
        });

    } catch (error) {
        console.error("Error while logging in user", error);
        return res.status(500).json({
            message: error.message
        });
    }
};  

