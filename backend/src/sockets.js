let io;

function initSocket(server) {
  const socketio = require('socket.io');
  io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

function emitTaskUpdate(task) {
  if (io) {
    io.emit('taskUpdated', task);
  }
}

module.exports = { initSocket, emitTaskUpdate }; 