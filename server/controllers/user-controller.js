import User from "../model/user-schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/email-service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || "shopsphere_jwt_secret";

// Temporary memory storage for signup OTPs and verified sessions
const signupOtps = new Map();

export const userSignup = async (req, res) => {
    try {
        console.log("req.body =", req.body);

        const { username, email, password } = req.body;

        // Force validation: Check if email has been verified via OTP
        const verifiedRecord = signupOtps.get(email);
        if (!verifiedRecord || !verifiedRecord.verified) {
            return res.status(400).json({ message: "Email verification is required before signing up!" });
        }

        const existUsername = await User.findOne({ username });
        if (existUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Remove the temporary validation token
        signupOtps.delete(email);

        // Salt and hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            ...req.body,
            password: hashedPassword,
            role: username.toLowerCase() === 'admin' ? 'admin' : 'user',
            isVerified: true
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
                role: newUser.role,
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
        const { email, isSignup } = req.body;

        if (isSignup) {
            const existUser = await User.findOne({ email });
            if (existUser) {
                return res.status(400).json({ message: "User already exists with this email" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            signupOtps.set(email, {
                otp,
                expires: new Date(Date.now() + 10 * 60000), // 10 minutes
                verified: false
            });

            const isSent = await sendOTP(email, otp);
            if (isSent) {
                return res.status(200).json({ message: "OTP sent successfully" });
            } else {
                return res.status(500).json({ message: "Failed to send OTP" });
            }
        }

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
        const { email, otp, isSignup } = req.body;

        if (isSignup) {
            const record = signupOtps.get(email);
            if (!record) return res.status(400).json({ message: "No OTP requested for this email" });
            if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
            if (new Date() > new Date(record.expires)) return res.status(400).json({ message: "OTP expired" });

            // Mark email as verified for next 15 minutes
            signupOtps.set(email, {
                verified: true,
                expires: new Date(Date.now() + 15 * 60000)
            });
            return res.status(200).json({ message: "Email verified successfully" });
        }

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
                role: user.role || 'user',
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
                role: user.role || 'user',
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

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            success: true,
            data: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { username, firstname, lastname, email } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { firstname, lastname, email } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                username: updatedUser.username,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                email: updatedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const becomeSeller = async (req, res) => {
    try {
        const { username, businessName, gstin, sellerPhone, sellerAddress } = req.body;

        if (!username || !businessName || !gstin || !sellerPhone || !sellerAddress) {
            return res.status(400).json({ message: "All fields are required to register as seller" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { username: username.toLowerCase() },
            { 
                $set: { 
                    role: 'seller',
                    isSeller: true,
                    businessName,
                    gstin,
                    sellerPhone,
                    sellerAddress
                } 
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Registered as seller successfully",
            data: {
                username: updatedUser.username,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

