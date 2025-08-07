// routes/studentProfile.route.js
const express = require('express');
const router = express.Router();

const studentProfileController = require('../controllers/studentProfile.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize(['student']), studentProfileController.completeStudentProfile);

router.get('/me', protect, authorize(['student']), studentProfileController.getMyStudentProfile);

router.put('/checkout', protect, authorize(['student']), studentProfileController.checkoutStudent); // <-- NEW ROUTE HERE

module.exports = router;