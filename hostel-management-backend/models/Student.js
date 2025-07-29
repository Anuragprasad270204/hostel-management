// models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: { // Reference to the User model (for authentication/login)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // A user can only be associated with one student profile
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll Number is required'],
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
  },
  email: { // Redundant but useful for quick lookups, linked to User model
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please use a valid email address'],
  },
  hostel: { // Reference to the Hostel model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel is required'],
  },
  room: { // For now, storing as string. Will link to Room model later.
    type: String,
    trim: true,
  },
  is_checked_in: { // Status of student check-in
    type: Boolean,
    default: false,
  },
  check_in_date: {
    type: Date,
  },
  check_out_date: {
    type: Date,
  },
  payment_status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending',
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', StudentSchema);