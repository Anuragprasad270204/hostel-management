// routes/auth.route.js - UPDATED TO USE CONTROLLER
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // Import controller

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);

module.exports = router;