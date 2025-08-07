// server.js - FINAL MODULAR BACKEND STRUCTURE (with studentProfile.route)
const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/hostels', require('./routes/hostel.route'));
app.use('/api/students', require('./routes/student.route'));
app.use('/api/rooms', require('./routes/room.route'));
app.use('/api/users', require('./routes/user.route'));
app.use('/api/student-profiles', require('./routes/studentProfile.route'));

app.get('/', (req, res) => {
  res.send('Hostel Management Backend API is running!');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}`);
  console.log(`Access backend at: http://localhost:${PORT}`);
});