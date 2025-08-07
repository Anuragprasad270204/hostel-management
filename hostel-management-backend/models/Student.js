// models/Student.js - UPDATED (hostel is not required)
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
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
  email: { 
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please use a valid email address'],
  },
  hostel: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: false,
  },
  room: { 
    type: String,
    trim: true,
  },
  is_checked_in: {
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