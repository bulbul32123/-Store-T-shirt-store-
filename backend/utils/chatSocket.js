const Chat = require("../models/Chat");
const { notifyAdmins, notifyUser } = require("./notify");

const onlineCustomers = new Map();
const adminViewers = new Map(); 
const customerViewers = new Map(); 

function addViewer(map, roomId, socketId) {
  if (!map.has(roomId)) map.set(roomId, new Set());
  map.get(roomId).add(socketId);
}
function removeViewer(map, roomId, socketId) {
  map.get(roomId)?.delete(socketId);
}

function markOnline(io, userId, socketId) {
  if (!onlineCustomers.has(userId)) onlineCustomers.set(userId, new Set());
  const wasOffline = onlineCustomers.get(userId).size === 0;
  onlineCustomers.get(userId).add(socketId);
  if (wasOffline)
    io.to("admins").emit("customer_status", { userId, online: true });
}

function markOffline(io, userId, socketId) {
  const set = onlineCustomers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    onlineCustomers.delete(userId);
    io.to("admins").emit("customer_status", { userId, online: false });
  }
}

function registerChatEvents(io, socket) {
 socket.on("join_chat", async (roomId) => {
   if (!roomId) return;
   socket.join(roomId);
   socket.data.customerRoom = roomId;
   addViewer(customerViewers, roomId, socket.id);
   if (socket.userId) markOnline(io, socket.userId, socket.id); 
 });

  socket.on("join_admin_room", (roomId) => {
    if (!roomId) return;
    if (socket.data.adminRoom && socket.data.adminRoom !== roomId) {
      socket.leave(socket.data.adminRoom);
      removeViewer(adminViewers, socket.data.adminRoom, socket.id);
    }
    socket.join(roomId);
    socket.data.adminRoom = roomId;
    addViewer(adminViewers, roomId, socket.id);
  });

  socket.on("send_message", async (payload) => {
    try {
      const { roomId, sender, text } = payload;
      if (!roomId || !sender || !text?.trim()) return;
      const chat = await Chat.findById(roomId).populate("user", "name");
      if (!chat) {
        socket.emit("chat_closed", { chatId: roomId }); 
        return;
      }

      const content = text.trim();
      chat.messages.push({ sender, content, timestamp: new Date() });

      const adminSocketIds = [...(adminViewers.get(roomId) || [])];
      const customerViewing = (customerViewers.get(roomId)?.size || 0) > 0;

      if (sender === "user") {
        chat.unreadByAdmin =
          adminSocketIds.length > 0 ? 0 : chat.unreadByAdmin + 1;
      } else {
        chat.unreadByUser = customerViewing ? 0 : chat.unreadByUser + 1;
      }
      await chat.save();
      const saved = chat.messages[chat.messages.length - 1];

      io.to(roomId).emit("new_message", {
        roomId,
        sender: saved.sender,
        text: saved.content,
        timestamp: saved.timestamp,
      });
      io.to("admins").emit("chat:updated", {
        roomId,
        lastMessage: saved,
        unreadByAdmin: chat.unreadByAdmin,
      });

      if (sender === "user") {
        const viewingAdminIds = adminSocketIds
          .map((sid) => io.sockets.sockets.get(sid)?.userId)
          .filter(Boolean);
        notifyAdmins({
          type: "chat_message",
          title: "New support message",
          message: `${chat.user.name}: ${content.slice(0, 80)}`,
          link: `/admin/support?chatId=${chat._id}`,
          meta: { chatId: chat._id.toString() },
          readByAdminIds: viewingAdminIds,
        });
      } else {
        notifyUser(chat.user._id, {
          type: "chat_message",
          title: "Support replied",
          message: content.slice(0, 80),
          link: null,
          meta: { chatId: chat._id.toString() },
          isRead: customerViewing,
        });
      }
    } catch (err) {
      console.error("[chat] send_message error:", err);
    }
  });

    socket.on("disconnect", () => {
      if (socket.data.customerRoom)
        removeViewer(customerViewers, socket.data.customerRoom, socket.id);
      if (socket.data.adminRoom)
        removeViewer(adminViewers, socket.data.adminRoom, socket.id);
      if (socket.userId) markOffline(io, socket.userId, socket.id);
    });
}

module.exports = { registerChatEvents, onlineCustomers };
