// routes/user.route.js - UPDATED TO USE CONTROLLER
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller'); // Import controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware still needed here

router.get('/', protect, authorize(['admin']), userController.getUsers);

module.exports = router;