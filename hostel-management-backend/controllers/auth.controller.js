// controllers/auth.controller.js
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const registerUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        if (!email || !password || !role) return res.status(400).json({ message: 'Please enter all fields: email, password, and role.' });
        if (!['admin', 'student'].includes(role.toLowerCase())) return res.status(400).json({ message: 'Invalid role. Role must be "admin" or "student".' });
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User with this email already exists.' });
        const user = await User.create({ email, password, role: role.toLowerCase() });
        const token = generateToken(user._id, user.role);
        res.status(201).json({ message: 'User registered successfully!', user: { id: user._id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Please enter all fields.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials (email not found).' });
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials (password mismatch).' });
        const token = generateToken(user._id, user.role);
        res.status(200).json({ message: 'Logged in successfully!', user: { id: user._id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

module.exports = { registerUser, loginUser };