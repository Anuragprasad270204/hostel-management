// routes/room.route.js - UPDATED TO USE CONTROLLER
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller'); // Import controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware still needed here

router.post('/', protect, authorize(['admin']), roomController.createRoom);

router.get('/', protect, roomController.getRooms);

router.get('/:id', protect, roomController.getRoomById);

router.put('/:id', protect, authorize(['admin']), roomController.updateRoom);

router.delete('/:id', protect, authorize(['admin']), roomController.deleteRoom);

router.post('/book', protect, authorize(['student']), roomController.bookRoom);

module.exports = router;