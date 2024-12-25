import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Register User
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            isMfaActive: false,
        });

        console.log("New User:", newUser);
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user", message: error.message });
    }
};

// Login User
export const login = async (req, res) => {
    console.log("The authenticated user is:", req.user);
    if (!req.user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    res.status(200).json({
        message: "User logged in successfully",
        username: req.user.username,
        isMfaActive: req.user.isMfaActive,
    });
};

// Get Authentication Status
export const authStatus = async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "User is authenticated",
            username: req.user.username,
            isMfaActive: req.user.isMfaActive,
        });
    } else {
        res.status(401).json({ message: "Unauthorized user" });
    }
};

// Logout User
export const logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        await req.logout((err) => {
            if (err) throw err;

            req.session.destroy((err) => {
                if (err) throw err;
                res.clearCookie("connect.sid");
                res.status(200).json({ message: "Logout successful" });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

// Setup 2FA
export const setup2FA = async (req, res) => {
    try {
        const user = req.user;
        const secret = speakeasy.generateSecret();

        console.log("Generated Secret:", secret);

        user.twoFactorSecret = secret.base32;
        user.isMfaActive = true;
        await user.save();

        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `${req.user.username}`,
            issuer: "two-factor-auth",
            encoding: "base32",
        });

        const qrImageUrl = await qrCode.toDataURL(url);

        res.status(200).json({
            secret: secret.base32,
            qrCode: qrImageUrl,
        });
    } catch (error) {
        res.status(500).json({ error: "Error setting up 2FA", message: error.message });
    }
};

// Verify 2FA
export const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = req.user;

        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA is not set up for this user" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
        });

        if (verified) {
            const jwtToken = jwt.sign(
                { username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.status(200).json({ message: "2FA verified", token: jwtToken });
        } else {
            res.status(400).json({ message: "Invalid 2FA token" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error verifying 2FA", message: error.message });
    }
};

// Reset 2FA
export const reset2FA = async (req, res) => {
    try {
        const user = req.user;

        user.twoFactorSecret = "";
        user.isMfaActive = false;
        await user.save();

        res.status(200).json({ message: "2FA reset successful" });
    } catch (error) {
        res.status(500).json({ error: "Error resetting 2FA", message: error.message });
    }
};
