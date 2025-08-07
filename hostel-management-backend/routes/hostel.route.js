// routes/hostel.route.js - UPDATED TO USE CONTROLLER
const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostel.controller'); // Import controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware still needed here

router.post('/', protect, authorize(['admin']), hostelController.createHostel);

router.get('/', hostelController.getHostels);

router.get('/:id', protect, hostelController.getHostelById);

router.put('/:id', protect, authorize(['admin']), hostelController.updateHostel);

router.delete('/:id', protect, authorize(['admin']), hostelController.deleteHostel);

module.exports = router;