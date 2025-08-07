// routes/student.route.js - UPDATED TO USE CONTROLLER
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller'); // Import controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware still needed here

router.get('/', protect, authorize(['admin']), studentController.getStudents);

router.post('/', protect, authorize(['admin']), studentController.createStudent);

router.put('/:id', protect, authorize(['admin']), studentController.updateStudent);

router.delete('/:id', protect, authorize(['admin']), studentController.deleteStudent);

module.exports = router;