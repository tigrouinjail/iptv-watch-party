const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Stockage en mémoire des rooms (pour un prototype - en prod utiliser Redis/DB)
const rooms = new Map(); // roomId -> { hostToken, hostId (current), streamUrl, contentTitle, videoState, participants: Map<socketId, {name, isHost}> , createdAt }

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateHostToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API simple pour info (optionnel)
app.get('/api/rooms', (req, res) => {
  const publicRooms = [];
  rooms.forEach((room, id) => {
    publicRooms.push({
      roomId: id,
      participants: room.participants.size,
      contentTitle: room.contentTitle || 'Aucun contenu'
    });
  });
  res.json(publicRooms);
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connexion: ${socket.id}`);

  // Créer une nouvelle room (l'hôte)
  socket.on('create-room', ({ username, contentTitle }) => {
    const roomId = generateRoomId();
    const hostToken = generateHostToken();
    
    const room = {
      hostToken,
      currentHostSocketId: socket.id,
      streamUrl: null,
      contentTitle: contentTitle || 'Contenu IPTV',
      videoState: {
        paused: true,
        currentTime: 0,
        lastUpdated: Date.now()
      },
      participants: new Map(),
      createdAt: Date.now()
    };

    // Ajouter le créateur comme participant + hôte
    room.participants.set(socket.id, {
      name: username || `Hôte-${socket.id.substring(0,4)}`,
      isHost: true
    });

    rooms.set(roomId, room);

    socket.join(roomId);

    // Confirmer la création avec les infos hôte
    socket.emit('room-created', {
      roomId,
      hostToken,
      isHost: true,
      contentTitle: room.contentTitle,
      streamUrl: room.streamUrl,
      videoState: room.videoState,
      participants: Array.from(room.participants.entries()).map(([id, p]) => ({ id, ...p }))
    });

    console.log(`[Room] Créée: ${roomId} par ${socket.id}`);
  });

  // Rejoindre une room existante
  socket.on('join-room', ({ roomId, username, hostToken }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Salle introuvable ou expirée.' });
      return;
    }

    const isHost = hostToken && hostToken === room.hostToken;

    // Mettre à jour le currentHostSocketId si c'est l'hôte légitime
    if (isHost) {
      room.currentHostSocketId = socket.id;
    }

    // Ajouter ou mettre à jour le participant
    const existing = room.participants.get(socket.id);
    const participantName = username || (existing ? existing.name : `Utilisateur-${socket.id.substring(0,4)}`);
    
    room.participants.set(socket.id, {
      name: participantName,
      isHost: isHost
    });

    socket.join(roomId);

    // Envoyer l'état actuel de la room au nouveau venu
    socket.emit('room-joined', {
      roomId,
      isHost,
      contentTitle: room.contentTitle,
      streamUrl: room.streamUrl,
      videoState: room.videoState,
      participants: Array.from(room.participants.entries()).map(([id, p]) => ({ id, ...p }))
    });

    // Notifier les autres
    socket.to(roomId).emit('participant-joined', {
      id: socket.id,
      name: participantName,
      isHost
    });

    // Mettre à jour la liste pour tous
    io.to(roomId).emit('participants-updated', {
      participants: Array.from(room.participants.entries()).map(([id, p]) => ({ id, ...p }))
    });

    console.log(`[Room] ${socket.id} a rejoint ${roomId} (host: ${isHost})`);
  });

  // Changer le flux IPTV (seulement hôte)
  socket.on('change-stream', ({ roomId, streamUrl, contentTitle, hostToken }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const isHost = participant && participant.isHost;

    if (!isHost) {
      socket.emit('error', { message: 'Seul l\'hôte peut changer le flux.' });
      return;
    }

    // Mettre à jour
    room.streamUrl = streamUrl || null;
    if (contentTitle) room.contentTitle = contentTitle;

    // Réinitialiser l'état vidéo
    room.videoState = {
      paused: true,
      currentTime: 0,
      lastUpdated: Date.now()
    };

    // Broadcast à toute la room
    io.to(roomId).emit('stream-changed', {
      streamUrl: room.streamUrl,
      contentTitle: room.contentTitle,
      videoState: room.videoState
    });

    console.log(`[Room ${roomId}] Flux changé par hôte: ${streamUrl}`);
  });

  // Contrôle vidéo depuis l'hôte (play, pause, seek)
  socket.on('video-control', ({ roomId, action, currentTime, hostToken }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant || !participant.isHost) {
      return; // Ignorer si pas hôte
    }

    const now = Date.now();
    let newState = { ...room.videoState };

    if (action === 'play') {
      newState.paused = false;
      if (typeof currentTime === 'number') newState.currentTime = currentTime;
    } else if (action === 'pause') {
      newState.paused = true;
      if (typeof currentTime === 'number') newState.currentTime = currentTime;
    } else if (action === 'seek' && typeof currentTime === 'number') {
      newState.currentTime = currentTime;
    }

    newState.lastUpdated = now;
    room.videoState = newState;

    // Broadcast le nouvel état
    io.to(roomId).emit('video-sync', {
      action,
      currentTime: newState.currentTime,
      paused: newState.paused,
      lastUpdated: newState.lastUpdated
    });
  });

  // Demande de resync depuis un viewer
  socket.on('request-sync', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.emit('video-sync', {
      action: 'sync',
      currentTime: room.videoState.currentTime,
      paused: room.videoState.paused,
      lastUpdated: room.videoState.lastUpdated
    });
  });

  // Chat message
  socket.on('chat-message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const name = participant ? participant.name : 'Anonyme';

    const chatMsg = {
      id: Date.now(),
      name,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    io.to(roomId).emit('chat-message', chatMsg);
  });

  // Mise à jour du nom (optionnel)
  socket.on('update-name', ({ roomId, newName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.name = newName || participant.name;
      io.to(roomId).emit('participants-updated', {
        participants: Array.from(room.participants.entries()).map(([id, p]) => ({ id, ...p }))
      });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`[Socket] Déconnexion: ${socket.id}`);

    // Nettoyer les rooms
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        const wasHost = room.participants.get(socket.id).isHost;
        room.participants.delete(socket.id);

        // Si c'était l'hôte courant, on garde le token mais on note qu'il n'est plus connecté
        if (wasHost && room.currentHostSocketId === socket.id) {
          room.currentHostSocketId = null;
        }

        // Notifier les autres
        socket.to(roomId).emit('participant-left', { id: socket.id });
        io.to(roomId).emit('participants-updated', {
          participants: Array.from(room.participants.entries()).map(([id, p]) => ({ id, ...p }))
        });

        // Optionnel: supprimer la room si vide et ancienne
        if (room.participants.size === 0 && Date.now() - room.createdAt > 1000 * 60 * 60) { // 1h
          rooms.delete(roomId);
          console.log(`[Room] Supprimée (vide): ${roomId}`);
        }
      }
    });
  });
});

// Nettoyage périodique des rooms vides (toutes les 30 min)
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (room.participants.size === 0 && now - room.createdAt > 1000 * 60 * 30) {
      rooms.delete(roomId);
      console.log(`[Cleanup] Room vide supprimée: ${roomId}`);
    }
  });
}, 1000 * 60 * 30);

server.listen(PORT, () => {
  console.log(`🚀 Serveur IPTV Watch Party démarré sur http://localhost:${PORT}`);
  console.log(`   Ouvrez http://localhost:${PORT} dans votre navigateur.`);
});