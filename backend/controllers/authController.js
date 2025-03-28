const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateNextUserId } = require('../utils/userIdGenerator');

const register = async (req, res) => {
    try {
        const { username, dob, email, password } = req.body;
        
        // Check if user exists with email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate the next user ID
        const usernameid = await generateNextUserId();

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        
        const user = new User({
            usernameid,
            username,
            dob,
            email,
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
            message: "User created successfully", 
            token,
            usernameid 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            message: "Login successful", 
            token,
            usernameid: user.usernameid,
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  