const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const Ad = require('../models/Ad');

// GET /api/chat/conversations - List all conversations
router.get('/conversations', async (req, res) => {
  try {
    const { filter } = req.query; // 'unread', 'my-ads', 'others-ads'
    const userId = req.user.id;

    let query = {
      participants: userId,
      isActive: true
    };

    // Apply filters
    if (filter === 'unread') {
      query['messages.isRead'] = false;
      query['messages.sender'] = { $ne: userId };
    }

    const conversations = await Chat.find(query)
      .populate({
        path: 'participants',
        select: 'firstName lastName avatar chatDisplayName'
      })
      .populate({
        path: 'ad',
        select: 'title images price status'
      })
      .populate({
        path: 'lastMessage',
        select: 'content type timestamp isRead'
      })
      .sort({ updatedAt: -1 });

    // Apply additional filters for ad ownership
    let filteredConversations = conversations;
    if (filter === 'my-ads') {
      filteredConversations = conversations.filter(conv => 
        conv.ad && conv.ad.owner && conv.ad.owner.toString() === userId
      );
    } else if (filter === 'others-ads') {
      filteredConversations = conversations.filter(conv => 
        conv.ad && conv.ad.owner && conv.ad.owner.toString() !== userId
      );
    }

    res.json({
      success: true,
      data: filteredConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chat/conversations/:id - Get messages in a conversation
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const conversation = await Chat.findOne({
      _id: id,
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar chatDisplayName'
    })
    .populate({
      path: 'ad',
      select: 'title images price status owner'
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Paginate messages
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const messages = conversation.messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex)
      .reverse();

    // Mark messages as read
    const unreadMessages = conversation.messages.filter(
      msg => !msg.isRead && msg.sender.toString() !== userId
    );
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => msg.isRead = true);
      await conversation.save();
    }

    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation.toObject(),
          messages: undefined
        },
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: conversation.messages.length,
          hasNext: endIndex < conversation.messages.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chat/send-message - Send a message
router.post('/send-message', async (req, res) => {
  try {
    const { conversationId, adId, recipientId, content, type = 'text' } = req.body;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await Chat.findOne({
        _id: conversationId,
        participants: senderId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
    } else {
      // New conversation
      if (!adId || !recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Ad ID and recipient ID are required for new conversations'
        });
      }

      // Check if conversation already exists
      conversation = await Chat.findOne({
        ad: adId,
        participants: { $all: [senderId, recipientId] }
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Chat({
          participants: [senderId, recipientId],
          ad: adId,
          messages: []
        });
      }
    }

    // Add message
    const message = {
      sender: senderId,
      content,
      type,
      timestamp: new Date(),
      isRead: false
    };

    conversation.messages.push(message);
    conversation.lastMessage = message;
    conversation.updatedAt = new Date();

    await conversation.save();

    // Populate for response
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

    res.json({
      success: true,
      data: {
        conversation,
        message
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chat/set-display-name - Set or update chat display name
router.post('/set-display-name', async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || displayName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Display name is required'
      });
    }

    const user = await User.findById(req.user.id);
    user.chatDisplayName = displayName.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Chat display name updated successfully',
      data: { displayName: user.chatDisplayName }
    });
  } catch (error) {
    console.error('Error setting display name:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chat/suspicious - List suspected spam chats
router.get('/suspicious', async (req, res) => {
  try {
    const userId = req.user.id;

    const suspiciousChats = await Chat.find({
      participants: userId,
      isSuspicious: true,
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar chatDisplayName'
    })
    .populate({
      path: 'ad',
      select: 'title images price'
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: suspiciousChats
    });
  } catch (error) {
    console.error('Error fetching suspicious chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chat/unread - List unread chats
router.get('/unread', async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadChats = await Chat.find({
      participants: userId,
      'messages.isRead': false,
      'messages.sender': { $ne: userId }
    })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar chatDisplayName'
    })
    .populate({
      path: 'ad',
      select: 'title images price'
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: unreadChats
    });
  } catch (error) {
    console.error('Error fetching unread chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chat/my-ads - Filter chat by user's ads
router.get('/my-ads', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's ads
    const userAds = await Ad.find({ owner: userId }).select('_id');
    const adIds = userAds.map(ad => ad._id);

    const chats = await Chat.find({
      participants: userId,
      ad: { $in: adIds },
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar chatDisplayName'
    })
    .populate({
      path: 'ad',
      select: 'title images price'
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching my ads chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chat/others-ads - Filter chat by other's ads
router.get('/others-ads', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's ads
    const userAds = await Ad.find({ owner: userId }).select('_id');
    const adIds = userAds.map(ad => ad._id);

    const chats = await Chat.find({
      participants: userId,
      ad: { $nin: adIds },
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar chatDisplayName'
    })
    .populate({
      path: 'ad',
      select: 'title images price'
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching others ads chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/chat/:id - Delete/disable chat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Soft delete - mark as inactive for this user
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chat/:id/mark-suspicious - Mark chat as suspicious
router.post('/:id/mark-suspicious', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.isSuspicious = true;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat marked as suspicious'
    });
  } catch (error) {
    console.error('Error marking chat as suspicious:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
