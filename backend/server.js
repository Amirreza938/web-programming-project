const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adRoutes = require('./routes/ads');
const bookmarkRoutes = require('./routes/bookmarks');
const noteRoutes = require('./routes/notes');
const activityRoutes = require('./routes/activities');
const professionalRoutes = require('./routes/professional');
const securityRoutes = require('./routes/security');
const settingsRoutes = require('./routes/settings');
const chatRoutes = require('./routes/chat');

// Import middleware
const authMiddleware = require('./middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dejanew', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/bookmarks', authMiddleware, bookmarkRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/professional', authMiddleware, professionalRoutes);
app.use('/api/security', authMiddleware, securityRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);

// Socket.io for real-time chat
const chatSocket = require('./sockets/chat');
chatSocket(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 DejaNew API is ready!`);
});

module.exports = app;
