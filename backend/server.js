const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_BUCKET', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const staffPortalRoutes = require('./routes/staffPortal.routes');
const clientPortalRoutes = require('./routes/clientPortal.routes');
const projectCommentRoutes = require('./routes/projectComment.routes');
const forgotPasswordRoutes = require('./routes/forgotPassword.routes');
const momRoutes = require('./routes/mom.routes');
const profileImageRoutes = require('./routes/profileImage.routes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit login attempts
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(apiLimiter);
app.use('/auth', authLimiter);

// Make io accessible to routes
app.set('io', io);

connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/auth/forgot', forgotPasswordRoutes);
app.use('/admin', adminRoutes);
app.use('/staff', staffPortalRoutes);
app.use('/client', clientPortalRoutes);
app.use('/mom', momRoutes);
app.use('/', projectCommentRoutes);
app.use('/api/users/profile-image', profileImageRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CMS API is running.' });
});

// Dynamic File Download Redirect (Force Inline Viewing)
const { getSignedUrl, downloadFile, getMimeType } = require('./utils/supabaseStorage');
app.get('/api/roadmap-file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).send('File path is required');

    // Download the file buffer from Supabase
    const fileData = await downloadFile(filePath);
    
    if (fileData) {
      const fileName = path.basename(filePath);
      const contentType = getMimeType(fileName);
      
      // Set headers for inline viewing
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      
      // Send the buffer directly
      const buffer = Buffer.from(await fileData.arrayBuffer());
      res.send(buffer);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('[Roadmap File Proxy] Error:', error);
    res.status(500).send('Error retrieving file');
  }
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
