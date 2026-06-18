require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDb } = require('../config/database');
const apiRoutes = require('../routes/api');

const app = express();

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static website from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Bind API routes
app.use('/api', apiRoutes);

// Custom admin route routing to public/admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Initialize DB schema on startup
initDb().catch(err => {
  console.error('Failed to initialize database on startup:', err);
});

module.exports = app;
