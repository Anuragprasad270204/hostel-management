// models/Hostel.js
const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Hostel address is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Hostel capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Occupancy cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

HostelSchema.pre('save', function (next) {
  if (this.currentOccupancy > this.capacity) {
    this.currentOccupancy = this.capacity;
  }
  next();
});

module.exports = mongoose.model('Hostel', HostelSchema);