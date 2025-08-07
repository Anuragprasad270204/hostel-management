// controllers/user.controller.js
const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role) {
            query.role = role;
        }
        const users = await User.find(query).select('-password'); // Fetch users, exclude password
        res.status(200).json(users);
    } catch (error) {
        console.error('Get Users Error:', error.message);
        res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
};

module.exports = { getUsers };