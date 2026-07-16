const Notification = require("../models/Notification");

exports.getAdminNotifications = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { audience: "admin" };
    if (req.query.types) {
      const types = req.query.types.split(",").filter(Boolean);
      if (types.length) filter.type = { $in: types };
    }
    if (req.query.search?.trim()) {
      const regex = { $regex: req.query.search.trim(), $options: "i" };
      filter.$or = [{ title: regex }, { message: regex }];
    }

    const docs = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    let mapped = docs.map((n) => ({
      ...n,
      isRead: n.readBy.some((id) => id.toString() === req.user.id),
      readBy: undefined,
    }));

    if (req.query.status === "unread") mapped = mapped.filter((n) => !n.isRead);
    if (req.query.status === "read") mapped = mapped.filter((n) => n.isRead);

    const total = mapped.length;
    const notifications = mapped.slice(skip, skip + limit);

    res.json({
      success: true,
      notifications,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error fetching notifications" });
  }
};

exports.deleteAdminNotification = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    await Notification.deleteOne({ _id: req.params.id, audience: "admin" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error deleting notification" });
  }
};

exports.bulkDeleteAdminNotifications = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    await Notification.deleteMany({ _id: { $in: ids }, audience: "admin" });
    res.json({ success: true, message: "Notifications deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error deleting notifications" });
  }
};

exports.getAdminUnreadCount = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    const count = await Notification.countDocuments({
      audience: "admin",
      readBy: { $ne: req.user.id },
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markAdminAsRead = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    await Notification.updateOne(
      { _id: req.params.id, audience: "admin" },
      { $addToSet: { readBy: req.user.id } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markAllAdminAsRead = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    await Notification.updateMany(
      { audience: "admin", readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markChatNotificationsReadAdmin = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  try {
    await Notification.updateMany(
      {
        audience: "admin",
        type: "chat_message",
        "meta.chatId": req.params.chatId,
        readBy: { $ne: req.user.id },
      },
      { $addToSet: { readBy: req.user.id } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};