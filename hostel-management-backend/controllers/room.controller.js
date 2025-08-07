// controllers/room.controller.js
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Student = require('../models/Student');
const User = require('../models/User'); 
const mongoose = require('mongoose');

const createRoom = async (req, res) => {
  const { roomNumber, hostel, floor, capacity, type, features, status } = req.body;

  try {
    if (!roomNumber || !hostel || !floor || !capacity) {
      return res.status(400).json({ message: 'Please provide roomNumber, hostel, floor, and capacity.' });
    }
    if (!mongoose.Types.ObjectId.isValid(hostel)) {
      return res.status(400).json({ message: 'Invalid Hostel ID format.' });
    }

    const associatedHostel = await Hostel.findById(hostel);
    if (!associatedHostel) {
      return res.status(404).json({ message: 'Associated hostel not found.' });
    }

    const roomExists = await Room.findOne({ roomNumber, hostel });
    if (roomExists) {
      return res.status(400).json({ message: `Room ${roomNumber} already exists in ${associatedHostel.name}.` });
    }

    const room = new Room({
      roomNumber,
      hostel,
      floor,
      capacity,
      type: type || 'Other',
      features: features || [],
      status: status || 'Operational',
      currentOccupancy: 0,
      isAvailable: true,
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);

  } catch (error) {
    console.error('Create Room Error:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating room.', error: error.message });
  }
};

const getRooms = async (req, res) => {
  const { hostelId, isAvailable } = req.query;
  let query = {};

  if (hostelId) {
    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ message: 'Invalid Hostel ID format.' });
    }
    query.hostel = hostelId;
  }
  if (isAvailable !== undefined) {
    query.isAvailable = (isAvailable === 'true');
  }

  try {
    const rooms = await Room.find(query).populate('hostel', 'name');
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Get Rooms Error:', error.message);
    res.status(500).json({ message: 'Server error fetching rooms.', error: error.message });
  }
};
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hostel', 'name');
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error('Get Single Room Error:', error.message);
    res.status(500).json({ message: 'Server error fetching room.', error: error.message });
  }
};
const updateRoom = async (req, res) => {
  const { roomNumber, hostel, floor, capacity, currentOccupancy, type, features, status } = req.body;
  const roomId = req.params.id;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    let oldHostel = null;
    let newHostel = null;

    if (hostel && room.hostel && room.hostel.toString() !== hostel) {
        oldHostel = await Hostel.findById(room.hostel);
        newHostel = await Hostel.findById(hostel);

        if (!newHostel) {
            return res.status(404).json({ message: 'New hostel not found for provided hostel ID.' });
        }

        if (oldHostel) {
            oldHostel.currentOccupancy = Math.max(0, (oldHostel.currentOccupancy || 0) - room.currentOccupancy);
            await oldHostel.save();
        }

        newHostel.currentOccupancy = (newHostel.currentOccupancy || 0) + (currentOccupancy || room.currentOccupancy);
        await newHostel.save();
    }

    room.roomNumber = roomNumber || room.roomNumber;
    room.hostel = hostel || room.hostel;
    room.floor = floor || room.floor;
    room.capacity = capacity || room.capacity;
    if (currentOccupancy !== undefined) {
        if (currentOccupancy < 0 || currentOccupancy > room.capacity) {
            return res.status(400).json({ message: 'Current occupancy must be between 0 and room capacity.' });
        }
        room.currentOccupancy = currentOccupancy;
    }
    room.type = type || room.type;
    room.features = features || room.features;
    room.status = status || room.status;

    const updatedRoom = await room.save();
    res.status(200).json({ message: 'Room updated successfully!', room: updatedRoom });

  } catch (error) {
    console.error('Update Room Error:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error updating room record.', error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if (room.hostel && room.currentOccupancy > 0) {
      const hostel = await Hostel.findById(room.hostel);
      if (hostel) {
        hostel.currentOccupancy = Math.max(0, (hostel.currentOccupancy || 0) - room.currentOccupancy);
        await hostel.save();
      }
    }

    const studentsInRoom = await Student.countDocuments({ room: room.roomNumber, hostel: room.hostel });
    if (studentsInRoom > 0) {
        return res.status(400).json({ message: `Cannot delete room. ${studentsInRoom} student(s) are currently assigned to this room.` });
    }

    await Room.findByIdAndDelete(roomId);
    res.status(200).json({ message: 'Room deleted successfully!' });

  } catch (error) {
    console.error('Delete Room Error:', error.message);
    res.status(500).json({ message: 'Server error deleting room record.', error: error.message });
  }
};
const bookRoom = async (req, res) => {
  const { roomId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID format.' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ message: 'Room is already full.' });
    }
    if (room.status !== 'Operational') {
        return res.status(400).json({ message: `Room is not operational (${room.status}). Cannot book.` });
    }

    let student = await Student.findOne({ user: req.user._id });

    if (!student) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'Associated user not found.' });
      }
      const defaultHostel = await Hostel.findOne({});
      if (!defaultHostel) {
        return res.status(500).json({ message: 'No hostels available to assign. Please contact admin.' });
      }

      student = await Student.create({
        user: user._id,
        rollNumber: `TEMP-${Date.now()}`,
        fullName: user.email.split('@')[0],
        email: user.email,
        hostel: defaultHostel._id,
        room: null,
        payment_status: 'Pending',
        is_checked_in: false
      });
      console.log(`[BOOK] Created new basic student profile for user: ${user.email}`);

    } else {
        if (student.hostel && student.room && student.hostel.toString() === room.hostel.toString() && student.room === room.roomNumber) {
            return res.status(400).json({ message: `You are already assigned to Room ${room.roomNumber} in ${room.hostel.name}.` });
        }
        if (student.hostel && student.room) {
            const oldHostel = await Hostel.findById(student.hostel);
            const oldRoom = await Room.findOne({roomNumber: student.room, hostel: student.hostel});

            if (oldRoom && oldRoom.currentOccupancy > 0) {
                oldRoom.currentOccupancy = Math.max(0, oldRoom.currentOccupancy - 1);
                await oldRoom.save();
            }
            if (oldHostel && oldHostel.currentOccupancy > 0) {
                oldHostel.currentOccupancy = Math.max(0, oldHostel.currentOccupancy - 1);
                await oldHostel.save();
            }
        }
    }

    student.hostel = room.hostel;
    student.room = room.roomNumber;
    student.is_checked_in = true;
    student.check_in_date = new Date();
    await student.save();

    room.currentOccupancy += 1;
    room.isAvailable = room.currentOccupancy < room.capacity;
    await room.save();

    const bookedHostel = await Hostel.findById(room.hostel);
    if (bookedHostel) {
        bookedHostel.currentOccupancy = (bookedHostel.currentOccupancy || 0) + 1;
        await bookedHostel.save();
    }

    res.status(200).json({ message: `Room ${room.roomNumber} booked successfully!`, room, student });

  } catch (error) {
    console.error('Direct Room Booking Error:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during room booking.', error: error.message });
  }
};

module.exports = { createRoom, getRooms, getRoomById, updateRoom, deleteRoom, bookRoom };