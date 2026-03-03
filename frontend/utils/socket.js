import io from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined. Set it in your .env.local (dev) or Vercel environment variables (prod).');
  }
  const socketURL = process.env.NEXT_PUBLIC_API_URL;
  
  socket = io(socketURL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.IO] Connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Project Discussion Room Functions
export const joinProjectRoom = (projectId, userId, userRole) => {
  const socket = getSocket();
  socket.emit('join_project_room', {
    projectId,
    userId,
    userRole,
    timestamp: new Date()
  });
};

export const leaveProjectRoom = (projectId, userId) => {
  const socket = getSocket();
  socket.emit('leave_project_room', {
    projectId,
    userId,
    timestamp: new Date()
  });
};

export const sendMessage = (projectId, message, userId, userName, userRole) => {
  const socket = getSocket();
  socket.emit('send_message', {
    projectId,
    message,
    userId,
    userName,
    userRole,
    timestamp: new Date()
  });
};

export const onMessageReceived = (callback) => {
  const socket = getSocket();
  socket.on('receive_message', callback);
};

export const offMessageReceived = (callback) => {
  const socket = getSocket();
  socket.off('receive_message', callback);
};

export const onUserTyping = (callback) => {
  const socket = getSocket();
  socket.on('user_typing', callback);
};

export const offUserTyping = (callback) => {
  const socket = getSocket();
  socket.off('user_typing', callback);
};

export const notifyTyping = (projectId, userId, userName) => {
  const socket = getSocket();
  socket.emit('typing', {
    projectId,
    userId,
    userName
  });
};

export const notifyStoppedTyping = (projectId, userId) => {
  const socket = getSocket();
  socket.emit('stop_typing', {
    projectId,
    userId
  });
};

export const onUserOnline = (callback) => {
  const socket = getSocket();
  socket.on('user_online', callback);
};

export const onUserOffline = (callback) => {
  const socket = getSocket();
  socket.on('user_offline', callback);
};
