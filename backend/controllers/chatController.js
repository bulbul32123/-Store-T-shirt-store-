const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res) => {
    try {
        const { subject, message, orderId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        // Create new chat
        const chat = await Chat.create({
            user: req.user.id,
            subject,
            order: orderId || null,
            messages: [
                {
                    sender: 'user',
                    content: message,
                    read: false
                }
            ]
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user chats
// @route   GET /api/chats
// @access  Private
exports.getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user.id })
            .sort({ lastUpdated: -1 });

        res.status(200).json(chats);
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all chats (admin)
// @route   GET /api/chats/all
// @access  Private/Admin
exports.getAllChats = async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;

        // Build filter
        const filter = {};

        if (status) {
            filter.status = status;
        }

        // Pagination
        const pageSize = parseInt(limit);
        const pageNumber = parseInt(page);
        const skip = (pageNumber - 1) * pageSize;

        // Execute query
        const chats = await Chat.find(filter)
            .populate('user', 'name email')
            .populate('order', 'orderStatus totalPrice')
            .sort({ lastUpdated: -1 })
            .skip(skip)
            .limit(pageSize);

        // Get total count for pagination
        const totalChats = await Chat.countDocuments(filter);

        res.status(200).json({
            chats,
            page: pageNumber,
            pages: Math.ceil(totalChats / pageSize),
            totalChats
        });
    } catch (error) {
        console.error('Get all chats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('user', 'name email')
            .populate('order');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if chat belongs to user or user is admin
        if (chat.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Mark messages as read if user is admin and sender is user
        if (req.user.role === 'admin') {
            chat.messages.forEach(message => {
                if (message.sender === 'user' && !message.read) {
                    message.read = true;
                }
            });
            await chat.save();
        }

        // Mark messages as read if user is the owner and sender is admin
        if (chat.user._id.toString() === req.user.id) {
            chat.messages.forEach(message => {
                if (message.sender === 'admin' && !message.read) {
                    message.read = true;
                }
            });
            await chat.save();
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if chat belongs to user or user is admin
        if (chat.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Add message
        const sender = req.user.role === 'admin' ? 'admin' : 'user';

        chat.messages.push({
            sender,
            content: message,
            read: false
        });

        chat.lastUpdated = Date.now();

        // If chat was resolved or closed, set to active
        if (chat.status !== 'active') {
            chat.status = 'active';
        }

        await chat.save();

        res.status(201).json(chat);
    } catch (error) {
        console.error('Add message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update chat status
// @route   PUT /api/chats/:id/status
// @access  Private/Admin
exports.updateChatStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['active', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Valid status required' });
        }

        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.status = status;
        await chat.save();

        res.status(200).json(chat);
    } catch (error) {
        console.error('Update chat status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get unread messages count
// @route   GET /api/chats/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';

        let filter = {};
        let matchCondition = {};

        if (isAdmin) {
            // Admin: Count chats with unread user messages
            matchCondition = { 'messages.sender': 'user', 'messages.read': false };
        } else {
            // User: Count their chats with unread admin messages
            filter = { user: req.user.id };
            matchCondition = { 'messages.sender': 'admin', 'messages.read': false };
        }

        const chats = await Chat.find(filter);

        let unreadCount = 0;

        chats.forEach(chat => {
            chat.messages.forEach(message => {
                if (
                    (isAdmin && message.sender === 'user' && !message.read) ||
                    (!isAdmin && message.sender === 'admin' && !message.read)
                ) {
                    unreadCount += 1;
                }
            });
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 