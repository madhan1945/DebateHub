const { verifyToken } = require('./config/jwt');
const User        = require('./models/User');
const ChatMessage = require('./models/ChatMessage');
const Notification = require('./models/Notification');

// Track online users per debate room: { debateId: Set of { userId, username, avatar } }
const debateRooms = new Map();

function initSocket(io) {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        socket.user = null;
        return next();
      }
      const decoded = verifyToken(token);
      const user    = await User.findById(decoded.id).select('username avatar reputationPoints role isBanned');
      if (!user || user.isBanned) {
        socket.user = null;
        return next();
      }
      socket.user = user;
      next();
    } catch {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    // ── JOIN DEBATE ROOM ──
    socket.on('join_debate', async ({ debateId }) => {
      if (!debateId) return;
      socket.join(debateId);

      // Track participant
      if (!debateRooms.has(debateId)) debateRooms.set(debateId, new Map());
      const room = debateRooms.get(debateId);

      if (socket.user) {
        room.set(socket.user._id.toString(), {
          userId:   socket.user._id.toString(),
          username: socket.user.username,
          avatar:   socket.user.avatar || '',
        });
      }

      // Send current participant list
      io.to(debateId).emit('participants_update', {
        participants: Array.from(room.values()),
        count: room.size,
      });

      // Send last 50 chat messages
      const history = await ChatMessage.find({ debate: debateId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'username avatar')
        .lean();
      socket.emit('chat_history', history.reverse());
    });

    // ── LEAVE DEBATE ROOM ──
    socket.on('leave_debate', async ({ debateId }) => {
      socket.leave(debateId);
      if (socket.user && debateRooms.has(debateId)) {
        const room = debateRooms.get(debateId);
        room.delete(socket.user._id.toString());

        if (room.size === 0) debateRooms.delete(debateId);
        else {
          io.to(debateId).emit('participants_update', {
            participants: Array.from(room.values()),
            count: room.size,
          });
        }
      }
    });

    // ── SEND CHAT MESSAGE ──
    socket.on('send_message', async ({ debateId, message }) => {
      if (!socket.user) return socket.emit('error', { message: 'Sign in to chat.' });
      if (!message?.trim()) return;
      if (message.trim().length > 500) return socket.emit('error', { message: 'Message too long.' });

      try {
        const saved = await ChatMessage.create({
          debate:  debateId,
          user:    socket.user._id,
          message: message.trim(),
          type:    'message',
        });

        const payload = {
          _id:       saved._id,
          message:   saved.message,
          type:      'message',
          createdAt: saved.createdAt,
          user: {
            _id:      socket.user._id,
            username: socket.user.username,
            avatar:   socket.user.avatar || '',
            reputationPoints: socket.user.reputationPoints,
          },
        };

        io.to(debateId).emit('new_message', payload);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── TYPING INDICATOR ──
    socket.on('typing_start', ({ debateId }) => {
      if (!socket.user) return;
      socket.to(debateId).emit('user_typing', { username: socket.user.username });
    });
    socket.on('typing_stop', ({ debateId }) => {
      if (!socket.user) return;
      socket.to(debateId).emit('user_stopped_typing', { username: socket.user.username });
    });

    // ── REAL-TIME ARGUMENT UPDATE (broadcast to room after new arg posted via REST) ──
    socket.on('argument_posted', ({ debateId, argument }) => {
      socket.to(debateId).emit('new_argument_live', argument);
    });

    // ── REAL-TIME VOTE UPDATE ──
    socket.on('vote_updated', ({ debateId, argumentId, upvotes, downvotes, score }) => {
      socket.to(debateId).emit('argument_vote_updated', { argumentId, upvotes, downvotes, score });
    });

    // ── DISCONNECT ──
    socket.on('disconnect', async () => {
      if (!socket.user) return;
      // Clean up all rooms this socket was in
      for (const [debateId, room] of debateRooms.entries()) {
        if (room.has(socket.user._id.toString())) {
          room.delete(socket.user._id.toString());
          if (room.size === 0) debateRooms.delete(debateId);
          else {
            io.to(debateId).emit('participants_update', {
              participants: Array.from(room.values()),
              count: room.size,
            });
          }
        }
      }
    });
  });

  console.log('⚡ Socket.IO initialized');
}

// Helper: send notification to a user in real-time if they are connected
async function sendNotification(io, recipientId, notification) {
  try {
    const saved = await Notification.create(notification);
    const populated = await saved.populate('sender', 'username avatar');
    io.to(`user_${recipientId}`).emit('new_notification', populated);
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

module.exports = { initSocket, sendNotification };
