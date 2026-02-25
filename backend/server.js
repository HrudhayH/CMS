const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const staffPortalRoutes = require('./routes/staffPortal.routes');
const clientPortalRoutes = require('./routes/clientPortal.routes');
const projectCommentRoutes = require('./routes/projectComment.routes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/staff', staffPortalRoutes);
app.use('/client', clientPortalRoutes);
app.use('/', projectCommentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CMS API is running.' });
});

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log(`[WebSocket] User connected: ${socket.id}`);

  // Join project room
  socket.on('join_project_room', (data) => {
    const { projectId, userId, userRole } = data;
    const roomName = `project_${projectId}`;
    socket.join(roomName);
    console.log(`[WebSocket] User ${userId} (${userRole}) joined room ${roomName}`);

    // Notify others that user joined
    socket.to(roomName).emit('user_online', {
      userId,
      userRole,
      timestamp: new Date()
    });
  });

  // Handle incoming comments
  socket.on('send_message', (data) => {
    const { projectId, message } = data;
    const roomName = `project_${projectId}`;

    // Broadcast message to all users in room
    io.to(roomName).emit('receive_message', {
      ...data,
      timestamp: new Date(),
      socketId: socket.id
    });

    console.log(`[WebSocket] Message sent in room ${roomName}:`, message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { projectId } = data;
    const roomName = `project_${projectId}`;
    socket.to(roomName).emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    const { projectId } = data;
    const roomName = `project_${projectId}`;
    socket.to(roomName).emit('user_stopped_typing', data);
  });

  // Leave project room
  socket.on('leave_project_room', (data) => {
    const { projectId, userId } = data;
    const roomName = `project_${projectId}`;
    socket.leave(roomName);
    console.log(`[WebSocket] User ${userId} left room ${roomName}`);

    socket.to(roomName).emit('user_offline', {
      userId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
