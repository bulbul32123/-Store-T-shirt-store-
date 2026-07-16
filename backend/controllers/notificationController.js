const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
          Notification.find({
            $or: [
              { isGlobal: true, audience: "user" },
              { recipient: req.user.id },
            ],
          })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Notification.countDocuments({
            $or: [
              { isGlobal: true, audience: "user" },
              { recipient: req.user.id },
            ],
          }),
        ]);

        const notifications = docs.map((n) => ({
            ...n,
            isRead: n.isGlobal ? n.readBy.some((id) => id.toString() === req.user.id) : n.isRead,
            readBy: undefined,
        }));

        res.json({
            success: true,
            notifications,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching notifications' });
    }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const [personalUnread, globalUnread] = await Promise.all([
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
      Notification.countDocuments({
        isGlobal: true,
        audience: "user",
        readBy: { $ne: req.user.id },
      }),
    ]);

    res.json({ success: true, count: personalUnread + globalUnread });
  } catch (err) {
    console.error("Unread count error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching unread count" });
  }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.isGlobal) {
            await Notification.updateOne(
                { _id: notification._id },
                { $addToSet: { readBy: req.user.id } }
            );
        } else {
            if (notification.recipient.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            notification.isRead = true;
            await notification.save();
        }

        res.json({ success: true, message: 'Marked as read' });
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ success: false, message: 'Server error marking as read' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Promise.all([
            Notification.updateMany(
                { recipient: req.user.id, isRead: false },
                { $set: { isRead: true } }
            ),
            Notification.updateMany(
                { isGlobal: true, readBy: { $ne: req.user.id } },
                { $addToSet: { readBy: req.user.id } }
            ),
        ]);

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark all as read error:', err);
        res.status(500).json({ success: false, message: 'Server error marking all as read' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.isGlobal) {
            return res.status(400).json({ success: false, message: 'Global notifications cannot be deleted' });
        }
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await notification.deleteOne();
        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        console.error('Delete notification error:', err);
        res.status(500).json({ success: false, message: 'Server error deleting notification' });
    }
};

exports.markChatNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        type: "chat_message",
        "meta.chatId": req.params.chatId,
        isRead: false,
      },
      { $set: { isRead: true } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};