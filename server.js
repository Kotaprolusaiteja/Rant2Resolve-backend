
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const supabase = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const issueRoutes = require('./src/routes/issues');
const chatRoutes = require('./src/routes/chat');
const opportunitiesRoutes = require('./src/routes/opportunities');
const applicationsRoutes = require('./src/routes/applications');
const announcementsRoutes = require('./src/routes/announcements');
const dashboardRoutes = require('./src/routes/dashboard');
const notificationsRoutes = require('./src/routes/notifications');
const { setIO } = require('./src/config/io');

const app = express();
const server = http.createServer(app);

// Improved Socket.io CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  process.env.FRONTEND_URL || 'https://rant2resolve-frontend.onrender.com'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Set io instance early so controllers can access it
setIO(io);

// Robust Middleware Configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Request Logging for Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationsRoutes);

// Controllers can access the shared io instance via src/config/io's getIO()

// Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const dbStatus = error ? 'disconnected' : 'connected';
    res.json({ status: 'ok', database: dbStatus });
  } catch (err) {
    res.json({ status: 'ok', database: 'disconnected' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Track user connections for targeted notifications
const userSockets = new Map(); // userId -> Set of socketIds

// Socket.io for Real-time Chat and Updates with Database Persistence
io.on('connection', async (socket) => {
  console.log('Socket Connected:', socket.id);

  // ==================== USER CONNECTION ====================
  socket.on('user_connect', (userId) => {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // ==================== NOTIFICATIONS ====================
  socket.on('subscribe_notifications', (userId) => {
    socket.join(`user_notifications_${userId}`);
    console.log(`User ${userId} subscribed to notifications`);
  });

  // ==================== CHAT ====================
  socket.on('join_chat', async () => {
    socket.join('global_chat');
    console.log(`User ${socket.id} joined global chat`);

    try {
      // Send previous messages from database to the newly connected user
      const { data: previousMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      socket.emit('load_messages', previousMessages);
    } catch (error) {
      console.error('Error loading previous messages:', error);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      // Save to database
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            message: data.text,
            sender_id: data.userId,
            sender_name: data.userName,
            role: data.userRole,
            likes: 0,
            liked_by: []
          }
        ])
        .select();

      if (error) throw error;

      // Format message for broadcasting
      const messageData = {
        id: newMessage[0].id,
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Broadcast to all users in global_chat room (including sender)
      io.to('global_chat').emit('receive_message', messageData);
    } catch (error) {
      console.error('Error saving/broadcasting message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // ==================== MESSAGE REACTIONS ====================
  socket.on('message_liked', (data) => {
    console.log('📩 Message like event received from client:', data);
    // Broadcast the like update to all connected users
    io.to('global_chat').emit('messageLiked', {
      messageId: data.messageId,
      likes: data.likes,
      likedBy: data.likedBy
    });
  });

  // ==================== OPPORTUNITIES ====================
  socket.on('opportunity_created', (opportunityData) => {
    io.emit('new_opportunity', opportunityData);
  });

  socket.on('opportunity_updated', (opportunityData) => {
    io.emit('update_opportunity', opportunityData);
  });

  socket.on('opportunity_deleted', (opportunityId) => {
    io.emit('remove_opportunity', opportunityId);
  });

  // ==================== ANNOUNCEMENTS ====================
  socket.on('announcement_created', (announcementData) => {
    io.emit('new_announcement', announcementData);
  });

  socket.on('announcement_updated', (announcementData) => {
    io.emit('update_announcement', announcementData);
  });

  socket.on('announcement_deleted', (announcementId) => {
    io.emit('remove_announcement', announcementId);
  });

  // ==================== APPLICATIONS ====================
  socket.on('application_status_updated', (applicationData) => {
    io.emit('update_application_status', applicationData);
  });

  // ==================== ISSUES ====================
  socket.on('issue_status_updated', (issueData) => {
    io.emit('update_issue_status', issueData);
  });

  socket.on('disconnect', () => {
    console.log('Socket Disconnected:', socket.id);
    // Remove user from tracking
    for (const [userId, socketIds] of userSockets.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          userSockets.delete(userId);
        }
      }
    }
  });
});

// Database connection & Server Start
const PORT = process.env.PORT || 5000;

// Start server immediately
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`=========================================`);

  // Test Supabase connection
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase Connection Established');
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
    console.log('Keep in mind the server is still running, but DB-dependent routes will fail.');
  }
});
