try { require('dotenv').config(); } catch {};
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/people', require('./routes/people'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/capabilities', require('./routes/capabilities'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/seniority-levels', require('./routes/seniorityLevels'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/freelance-pools', require('./routes/freelancePools'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/chat', require('./routes/chat'));

// Serve built client in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Error handler
app.use(require('./middleware/errorHandler'));

// Socket.io
require('./socket')(io);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spark-org-chart')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
