const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// ✅ ADD THIS ROOT ROUTE
app.get('/', (req, res) => {
  res.json({ 
    message: 'FYP Manager API is running!',
    status: 'active',
    endpoints: {
      register: '/api/auth/register/admin',
      login: '/api/auth/login',
      verify: '/api/auth/verify'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});