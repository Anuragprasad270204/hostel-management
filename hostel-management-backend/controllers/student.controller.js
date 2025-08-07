// controllers/student.controller.js
const Student = require('../models/Student');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const mongoose = require('mongoose');

const getStudents = async (req, res) => {
  const { hostelId } = req.query;
  let query = {};
  if (hostelId) {
    if (!mongoose.Types.ObjectId.isValid(hostelId)) return res.status(400).json({ message: 'Invalid Hostel ID format.' });
    query.hostel = hostelId;
  }
  try {
    const students = await Student.find(query)
      .populate('user', 'email role')
      .populate('hostel', 'name');
    res.status(200).json(students);
  } catch (error) {
    console.error('Get Students Error:', error.message);
    res.status(500).json({ message: 'Server error fetching students.', error: error.message });
  }
};

const createStudent = async (req, res) => {
  const { userId, rollNumber, fullName, email, hostelId, room, payment_status, contactNumber, emergencyContact } = req.body;
  try {
    if (!userId || !rollNumber || !fullName || !email || !hostelId) { return res.status(400).json({ message: 'Please provide userId, rollNumber, fullName, email, and hostelId.' }); }
    if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).json({ message: 'Invalid userId format.' }); }
    if (!mongoose.Types.ObjectId.isValid(hostelId)) { return res.status(400).json({ message: 'Invalid hostelId format.' }); }
    const studentExistsByRoll = await Student.findOne({ rollNumber });
    if (studentExistsByRoll) { return res.status(400).json({ message: 'Student with this roll number already exists.' }); }
    const studentExistsByUser = await Student.findOne({ user: userId });
    if (studentExistsByUser) { return res.status(400).json({ message: 'This user ID is already associated with a student record.' }); }
    const studentExistsByEmail = await Student.findOne({ email });
    if (studentExistsByEmail) { return res.status(400).json({ message: 'Student with this email already exists.' }); }
    const user = await User.findById(userId);
    if (!user) { return res.status(404).json({ message: 'User not found for the provided userId.' }); }
    if (user.role !== 'student') { return res.status(400).json({ message: 'Provided userId must belong to a student role.' }); }
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) { return res.status(404).json({ message: 'Hostel not found for the provided hostelId.' }); }
    const newStudent = await Student.create({
      user: userId, rollNumber, fullName, email, hostel: hostelId, room: room || null, payment_status: payment_status || 'Pending', contactNumber: contactNumber || null, emergencyContact: emergencyContact || {}, is_checked_in: false, check_in_date: null, check_out_date: null
    });
    const createdHostel = await Hostel.findById(hostelId);
    if (createdHostel) {
      createdHostel.currentOccupancy = (createdHostel.currentOccupancy || 0) + 1;
      await createdHostel.save();
    }
    res.status(201).json({ message: 'Student created successfully!', student: newStudent });
  } catch (error) {
    console.error('Create Student Error:', error);
    if (error.name === 'ValidationError') { let messages = Object.values(error.errors).map(val => val.message); return res.status(400).json({ message: messages.join(', ') }); }
    res.status(500).json({ message: 'Server error creating student record.', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  const { rollNumber, fullName, email, hostelId, room, is_checked_in, check_in_date, check_out_date, payment_status, contactNumber, emergencyContact } = req.body;
  const studentId = req.params.id;
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    let oldHostel = null; let newHostel = null;
    if (hostelId && student.hostel && student.hostel.toString() !== hostelId) {
        oldHostel = await Hostel.findById(student.hostel); newHostel = await Hostel.findById(hostelId);
        if (!newHostel) return res.status(404).json({ message: 'New hostel not found for provided hostelId.' });
        if (oldHostel) { oldHostel.currentOccupancy = Math.max(0, (oldHostel.currentOccupancy || 0) - 1); await oldHostel.save(); }
        newHostel.currentOccupancy = (newHostel.currentOccupancy || 0) + 1; await newHostel.save();
    }
    student.rollNumber = rollNumber || student.rollNumber; student.fullName = fullName || student.fullName; student.email = email || student.email; student.hostel = hostelId || student.hostel; student.room = room || student.room; if (typeof is_checked_in === 'boolean') { student.is_checked_in = is_checked_in; if (is_checked_in && !student.check_in_date) { student.check_in_date = new Date(); student.check_out_date = null; } else if (!is_checked_in && !student.check_out_date) { student.check_out_date = new Date(); } } student.payment_status = payment_status || student.payment_status; student.contactNumber = contactNumber || student.contactNumber; student.emergencyContact = emergencyContact || student.emergencyContact;
    const updatedStudent = await student.save();
    res.status(200).json({ message: 'Student updated successfully!', student: updatedStudent });
  } catch (error) {
    console.error('Update Student Error:', error.message);
    if (error.name === 'ValidationError') { let messages = Object.values(error.errors).map(val => val.message); return res.status(400).json({ message: messages.join(', ') }); }
    res.status(500).json({ message: 'Server error updating student record.', error: error.message });
  }
};
const deleteStudent = async (req, res) => {
  const studentId = req.params.id;
  try {
    const student = await Student.findById(studentId);
    if (!student) { return res.status(404).json({ message: 'Student not found.' }); }
    if (student.hostel) {
      const hostel = await Hostel.findById(student.hostel);
      if (hostel) { hostel.currentOccupancy = Math.max(0, (hostel.currentOccupancy || 0) - 1); await hostel.save(); }
    }
    await Student.findByIdAndDelete(studentId);
    res.status(200).json({ message: 'Student deleted successfully!' });
  } catch (error) {
    console.error('Delete Student Error:', error.message);
    res.status(500).json({ message: 'Server error deleting student record.', error: error.message });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };