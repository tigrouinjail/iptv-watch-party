const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

const rooms = new Map();

function generateRoomId() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function generateHostToken() { return Math.random().toString(36).substring(2, 20); }

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('create-room', ({ username }) => {
    const roomId = generateRoomId();
    const hostToken = generateHostToken();
    const room = {
      hostToken,
      streamUrl: null,
      contentTitle: 'Aucun contenu',
      videoState: { paused: true, currentTime: 0 },
      participants: new Map()
    };
    room.participants.set(socket.id, { name: username || 'Admin', isHost: true });
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room-created', { roomId, hostToken, isHost: true });
  });

  socket.on('join-room', ({ roomId, username, hostToken }) => {
    const room = rooms.get(roomId);
    if (!room) return socket.emit('error', { message: 'Salle introuvable' });
    const isHost = hostToken === room.hostToken;
    room.participants.set(socket.id, { name: username || 'Spectateur', isHost });
    socket.join(roomId);
    socket.emit('room-joined', {
      roomId, isHost,
      streamUrl: room.streamUrl,
      contentTitle: room.contentTitle,
      videoState: room.videoState
    });
    io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
  });

  socket.on('change-stream', ({ roomId, streamUrl, contentTitle, hostToken }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (!participant || !participant.isHost) return;
    room.streamUrl = streamUrl;
    room.contentTitle = contentTitle || 'Contenu';
    io.to(roomId).emit('stream-changed', { streamUrl, contentTitle: room.contentTitle });
  });

  socket.on('video-control', ({ roomId, action, currentTime }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (!participant || !participant.isHost) return;
    room.videoState = { paused: action === 'pause', currentTime: currentTime || 0 };
    io.to(roomId).emit('video-sync', room.videoState);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
      }
    });
  });
});

server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));