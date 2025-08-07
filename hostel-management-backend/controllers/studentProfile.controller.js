// controllers/studentProfile.controller.js
const Student = require('../models/Student'); // Student model
const User = require('../models/User');     // User model
const Hostel = require('../models/Hostel');   // Hostel model
const Room = require('../models/Room');     // Room model
const mongoose = require('mongoose');
const completeStudentProfile = async (req, res) => {
  const { rollNumber, fullName, email, hostelId, room, payment_status, contactNumber, emergencyContact } = req.body;

  try {
    const user = req.user; 

    if (!rollNumber || !fullName || !hostelId || !email) {
      return res.status(400).json({ message: 'Please provide roll number, full name, email, and hostel ID.' });
    }
    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
        return res.status(400).json({ message: 'Invalid Hostel ID format.' });
    }
    if (email !== user.email) { 
      return res.status(400).json({ message: 'Provided email must match your registered user email.' });
    }

    let student = await Student.findOne({ user: user._id });
    if (student) {
      return res.status(400).json({ message: 'A student profile already exists for this user. You can update it instead.' });
    }
    const studentExistsByRoll = await Student.findOne({ rollNumber });
    if (studentExistsByRoll) { return res.status(400).json({ message: 'Student with this roll number already exists.' }); }
    const studentExistsByEmail = await Student.findOne({ email });
    if (studentExistsByEmail) { return res.status(400).json({ message: 'Student with this email already exists.' }); }


    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
        return res.status(404).json({ message: 'Hostel not found for the provided hostelId.' });
    }

    const newStudent = await Student.create({
      user: user._id,
      rollNumber,
      fullName,
      email,
      hostel: hostelId,
      room: room || null,
      payment_status: payment_status || 'Pending',
      contactNumber: contactNumber || null,
      emergencyContact: emergencyContact || {},
      is_checked_in: false,
      check_in_date: null,
      check_out_date: null
    });

    hostel.currentOccupancy = (hostel.currentOccupancy || 0) + 1;
    await hostel.save();

    res.status(201).json({ message: 'Student profile created successfully!', student: newStudent });

  } catch (error) {
    console.error('Create Student Profile Error:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating student profile.', error: error.message });
  }
};
const getMyStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('hostel', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found for this user. Please complete your profile.' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Get Student Profile Error:', error.message);
    res.status(500).json({ message: 'Server error fetching student profile.', error: error.message });
  }
};
const checkoutStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Cannot check out.' });
    }
    if (!student.is_checked_in || !student.hostel || !student.room) {
        return res.status(400).json({ message: 'You are not currently checked into a room.' });
    }

    const room = await Room.findOne({ roomNumber: student.room, hostel: student.hostel });
    const hostel = await Hostel.findById(student.hostel);

    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      room.isAvailable = room.currentOccupancy < room.capacity;
      await room.save();
    }
    if (hostel && hostel.currentOccupancy > 0) {
        hostel.currentOccupancy = Math.max(0, hostel.currentOccupancy - 1);
        await hostel.save();
    }
    student.is_checked_in = false;
    student.check_out_date = new Date();
    student.room = null;
    student.hostel = null;
    await student.save();

    res.status(200).json({ message: 'Checked out successfully!', student });

  } catch (error) {
    console.error('Check Out API Error:', error.message);
    res.status(500).json({ message: 'Server error during check-out.', error: error.message });
  }
};

module.exports = { completeStudentProfile, getMyStudentProfile, checkoutStudent };