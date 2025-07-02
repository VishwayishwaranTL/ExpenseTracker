import jwt from "jsonwebtoken";
import User from "../model/User.js";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const registerUser = async (req, res) => {
    const { fullName, email, password, profileImgUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImgUrl,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Error in registering the user", error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { password: pwd, ...userData } = user._doc;

        res.status(200).json({
            id: user._id,
            user: userData,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user info", error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    const { fullName, profileImgUrl, password } = req.body;

    const user = await User.findById(req.user.id);
    if (fullName) user.fullName = fullName;
    if (profileImgUrl) user.profileImgUrl = profileImgUrl;
    if (password) user.password = password;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
};
