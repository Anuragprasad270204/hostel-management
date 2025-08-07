// controllers/hostel.controller.js
const Hostel = require('../models/Hostel');
const Student = require('../models/Student'); 
const mongoose = require('mongoose'); 

const createHostel = async (req, res) => {
  const { name, address, capacity, description } = req.body;
  try {
    if (!name || !address || !capacity) return res.status(400).json({ message: 'Please enter all required hostel fields: name, address, and capacity.' });
    if (capacity <= 0) return res.status(400).json({ message: 'Capacity must be a positive number.' });
    const hostelExists = await Hostel.findOne({ name });
    if (hostelExists) return res.status(400).json({ message: 'Hostel with this name already exists.' });
    const hostel = new Hostel({ name, address, capacity, description });
    const createdHostel = await hostel.save();
    res.status(201).json(createdHostel);
  } catch (error) {
    console.error('Create Hostel Error:', error.message);
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Server error creating hostel.', error: error.message });
  }
};

const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    res.status(200).json(hostels);
  } catch (error) {
    console.error('Get Hostels Error:', error.message);
    res.status(500).json({ message: 'Server error fetching hostels.', error: error.message });
  }
};

const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found.' });
    res.status(200).json(hostel);
  } catch (error) {
    console.error('Get Single Hostel Error:', error.message);
    res.status(500).json({ message: 'Server error fetching hostel.', error: error.message });
  }
};

const updateHostel = async (req, res) => {
  const { name, address, capacity, description } = req.body;
  const hostelId = req.params.id;
  try {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found.' });
    if (name && name !== hostel.name) {
      const nameExists = await Hostel.findOne({ name });
      if (nameExists && nameExists._id.toString() !== hostelId) return res.status(400).json({ message: 'Hostel with this name already exists.' });
    }
    hostel.name = name || hostel.name;
    hostel.address = address || hostel.address;
    hostel.capacity = capacity || hostel.capacity;
    hostel.description = description || hostel.description;
    if (capacity && capacity < hostel.currentOccupancy) {
        hostel.currentOccupancy = capacity;
    }
    const updatedHostel = await hostel.save();
    res.status(200).json({ message: 'Hostel updated successfully!', hostel: updatedHostel });
  } catch (error) {
    console.error('Update Hostel Error:', error.message);
    if (error.name === 'ValidationError') { let messages = Object.values(error.errors).map(val => val.message); return res.status(400).json({ message: messages.join(', ') }); }
    res.status(500).json({ message: 'Server error updating hostel.', error: error.message });
  }
};

const deleteHostel = async (req, res) => {
  const hostelId = req.params.id;
  try {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found.' });
    const studentsInHostel = await Student.countDocuments({ hostel: hostelId });
    if (studentsInHostel > 0) { return res.status(400).json({ message: `Cannot delete hostel. ${studentsInHostel} student(s) are currently assigned to it.` }); }
    await Hostel.findByIdAndDelete(hostelId);
    res.status(200).json({ message: 'Hostel deleted successfully!' });
  } catch (error) {
    console.error('Delete Hostel Error:', error.message);
    res.status(500).json({ message: 'Server error deleting hostel.', error: error.message });
  }
};

module.exports = { createHostel, getHostels, getHostelById, updateHostel, deleteHostel };