// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
  },
  hostel: { // Reference to the Hostel model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel ID is required'],
  },
  floor: {
    type: String, // e.g., "1st Floor", "Ground Floor"
    trim: true,
    required: [true, 'Floor is required'],
  },
  capacity: { // Max number of students this room can hold
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  currentOccupancy: { // How many students are currently assigned/checked into this room
    type: Number,
    default: 0,
    min: [0, 'Occupancy cannot be negative'],
  },
  isAvailable: { // Calculated based on currentOccupancy < capacity
    type: Boolean,
    default: true,
  },
  type: { // e.g., "Single", "Double", "Triple", "Quad"
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Other'],
    default: 'Other',
  },
  features: [String], // Array of strings like "AC", "Attached Bathroom", "Balcony"
  status: { // Overall room status, e.g., "operational", "under_maintenance", "damaged"
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Damaged'],
    default: 'Operational',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Ensure combination of roomNumber and hostel is unique
  indexes: [{ unique: true, fields: ['roomNumber', 'hostel'] }]
});

// Pre-save hook to update isAvailable based on occupancy and ensure occupancy doesn't exceed capacity
RoomSchema.pre('save', function(next) {
  if (this.currentOccupancy > this.capacity) {
      this.currentOccupancy = this.capacity; // Cap occupancy at capacity if it exceeds
  }
  this.isAvailable = this.currentOccupancy < this.capacity;
  next();
});

module.exports = mongoose.model('Room', RoomSchema);