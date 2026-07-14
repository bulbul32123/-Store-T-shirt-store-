const Chat = require("../models/Chat");
const { notifyAdmins, notifyUser } = require("../utils/notify");

// GET /api/chats/me — customer's own chat (creates one if none exists)
exports.getMyChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({
      user: req.user.id,
      status: { $ne: "closed" },
    }).sort({ createdAt: -1 });
    if (!chat) {
      chat = await Chat.create({
        user: req.user.id,
        subject: "General Support",
      });
    }
    // customer opening the widget clears their unread badge
    if (chat.unreadByUser > 0) {
      chat.unreadByUser = 0;
      await chat.save();
    }
    res.json({ chat });
  } catch (err) {
    console.error("getMyChat:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

// GET /api/admin/chats — sidebar list, newest activity first
exports.getAdminChats = async (req, res) => {
  try {
    const chats = await Chat.find({ status: { $ne: "closed" } })
      .populate("user", "name email avatar profilePicture phone")
      .sort({ lastUpdated: -1 })
      .lean();

    const list = chats.map((c) => ({
      _id: c._id,
      user: c.user,
      status: c.status,
      unreadByAdmin: c.unreadByAdmin,
      lastMessage: c.messages?.[c.messages.length - 1] || null,
      lastUpdated: c.lastUpdated,
    }));

    res.json({ chats: list });
  } catch (err) {
    console.error("getAdminChats:", err);
    res.status(500).json({ message: "Failed to load chats" });
  }
};

// GET /api/admin/chats/:id — full thread for the active chat window
exports.getAdminChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "user",
      "name email avatar profilePicture phone address notes",
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.unreadByAdmin > 0) {
      chat.unreadByAdmin = 0;
      await chat.save();
    }
    res.json({ chat });
  } catch (err) {
    console.error("getAdminChatById:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

// PATCH /api/admin/chats/:id/notes — save internal admin note on the customer
exports.updateChatCustomerNote = async (req, res) => {
  try {
    const { note } = req.body;
    const chat = await Chat.findById(req.params.id).populate("user");
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.user.notes.push({ text: note, addedBy: req.user.name || "Admin" });
    await chat.user.save();
    res.json({ message: "Note added", notes: chat.user.notes });
  } catch (err) {
    console.error("updateChatCustomerNote:", err);
    res.status(500).json({ message: "Failed to save note" });
  }
};

// DELETE /api/admin/chats/:id
exports.deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const customerId = chat.user;
        await chat.deleteOne();

        const { emitToUser } = require('../utils/socket');
        emitToUser(customerId, 'chat_closed', { chatId: req.params.id });

        res.json({ message: 'Chat deleted' });
    } catch (err) {
        console.error('deleteChat:', err);
        res.status(500).json({ message: 'Failed to delete chat' });
    }
};

exports.persistMessage = async ({ roomId, sender, content }) => {
  const chat = await Chat.findById(roomId).populate("user", "name");
  if (!chat) return null;

  const message = { sender, content, timestamp: new Date() };
  chat.messages.push(message);

  if (sender === "user") {
    chat.unreadByAdmin += 1;
    notifyAdmins({
      type: "system",
      title: "New support message",
      message: `${chat.user.name}: ${content.slice(0, 80)}`,
      link: `/admin/support?chatId=${chat._id}`,
    });
  } else {
    chat.unreadByUser += 1;
    notifyUser(chat.user._id, {
      type: "system",
      title: "Support replied",
      message: content.slice(0, 80),
      link: `/profile`,
    });
  }

  await chat.save();
  return chat.messages[chat.messages.length - 1];
};