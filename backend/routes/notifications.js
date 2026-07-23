
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  markChatNotificationsRead,
} = require("../controllers/notificationController");
const {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminAsRead,
  markAllAdminAsRead,
  deleteAdminNotification,
  markChatNotificationsReadAdmin,
  bulkDeleteAdminNotifications, // ADD these
} = require("../controllers/adminNotificationController");

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

router.put("/chat/:chatId/read", protect, markChatNotificationsRead);
router.put("/admin/chat/:chatId/read", protect, markChatNotificationsReadAdmin);

router.delete("/admin/:id", protect, deleteAdminNotification);
router.post("/admin/bulk-delete", protect, bulkDeleteAdminNotifications);

router.get("/admin/all", protect, getAdminNotifications);
router.get("/admin/unread-count", protect, getAdminUnreadCount);
router.put("/admin/:id/read", protect, markAdminAsRead);
router.put("/admin/read-all", protect, markAllAdminAsRead);

module.exports = router;