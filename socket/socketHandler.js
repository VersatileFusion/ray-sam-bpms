const socketio = require('socket.io');

let io = null;

function initializeSocket(server) {
  io = socketio(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    // You can add authentication middleware here if needed
    // For now, we'll allow all connections
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join request-specific room for real-time updates
    socket.on('join-request-room', (requestId) => {
      socket.join(`request-${requestId}`);
      console.log(`Socket ${socket.id} joined request room: ${requestId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

// Helper functions to emit events
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
}

function emitToRequest(requestId, event, data) {
  if (io) {
    io.to(`request-${requestId}`).emit(event, data);
  }
}

function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRequest,
  emitToAll
};

