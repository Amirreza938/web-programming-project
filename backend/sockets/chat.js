const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join conversation rooms
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Chat.findOne({
          _id: conversationId,
          participants: socket.userId
        });

        if (conversation) {
          socket.join(`conversation_${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;

        const conversation = await Chat.findOne({
          _id: conversationId,
          participants: socket.userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message
        const message = {
          sender: socket.userId,
          content,
          type,
          timestamp: new Date(),
          isRead: false
        };

        conversation.messages.push(message);
        conversation.lastMessage = message;
        conversation.updatedAt = new Date();

        await conversation.save();

        // Populate message for broadcasting
        await conversation.populate([
          {
            path: 'participants',
            select: 'firstName lastName avatar chatDisplayName'
          },
          {
            path: 'ad',
            select: 'title images price'
          }
        ]);

        const populatedMessage = {
          ...message,
          sender: conversation.participants.find(p => p._id.toString() === socket.userId)
        };

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', {
          conversationId,
          message: populatedMessage,
          conversation: {
            _id: conversation._id,
            lastMessage: message,
            updatedAt: conversation.updatedAt
          }
        });

        // Send notification to other participants
        const otherParticipants = conversation.participants.filter(
          p => p._id.toString() !== socket.userId
        );

        otherParticipants.forEach(participant => {
          io.to(`user_${participant._id}`).emit('new_message_notification', {
            conversationId,
            sender: conversation.participants.find(p => p._id.toString() === socket.userId),
            message: populatedMessage,
            ad: conversation.ad
          });
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          chatDisplayName: socket.user.chatDisplayName
        }
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;

        const conversation = await Chat.findOne({
          _id: conversationId,
          participants: socket.userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Mark messages as read
        let updated = false;
        conversation.messages.forEach(message => {
          if (messageIds.includes(message._id.toString()) && 
              message.sender.toString() !== socket.userId && 
              !message.isRead) {
            message.isRead = true;
            updated = true;
          }
        });

        if (updated) {
          await conversation.save();

          // Notify other participants about read status
          socket.to(`conversation_${conversationId}`).emit('messages_read', {
            conversationId,
            messageIds,
            readBy: socket.userId
          });
        }

      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle user status updates
    socket.on('update_status', (status) => {
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Notify other users about offline status
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status: 'offline'
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};
