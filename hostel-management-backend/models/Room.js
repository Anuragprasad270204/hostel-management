// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel ID is required'],
  },
  floor: {
    type: String,
    trim: true,
    required: [true, 'Floor is required'],
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  currentOccupancy: { 
    type: Number,
    default: 0,
    min: [0, 'Occupancy cannot be negative'],
  },
  isAvailable: { 
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Other'],
    default: 'Other',
  },
  features: [String], 
  status: { 
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Damaged'],
    default: 'Operational',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  indexes: [{ unique: true, fields: ['roomNumber', 'hostel'] }]
});

RoomSchema.pre('save', function(next) {
  if (this.currentOccupancy > this.capacity) {
      this.currentOccupancy = this.capacity; 
  }
  this.isAvailable = this.currentOccupancy < this.capacity;
  next();
});

module.exports = mongoose.model('Room', RoomSchema);