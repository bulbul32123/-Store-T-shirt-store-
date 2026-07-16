
const Notification = require("../models/Notification");
const {
  emitToUser,
  emitToUsers,
  emitGlobal,
  emitToAdmins,
} = require("./socket");

exports.notifyAll = async ({
  type,
  title,
  message,
  link = null,
  image = null,
  meta = {},
}) => {
  try {
    const notification = await Notification.create({
      isGlobal: true,
      type,
      title,
      message,
      link,
      image,
      meta,
    });
    emitGlobal("notification:new", notification);
    return notification;
  } catch (err) {
    console.error("notifyAll error:", err);
    return null;
  }
};

exports.notifyUser = async (
  userId,
  { type, title, message, link = null, image = null, meta = {} },
) => {
  console.log("review error1", userId, type, title, message, link);
  try {
    const notification = await Notification.create({
      recipient: userId,
      type,
      title,
      message,
      link,
      image,
      meta,
    });
    emitToUser(userId, "notification:new", notification);
    return notification;
  } catch (err) {
    console.error("notifyUser error:", err);
    return null;
  }
};

exports.notifyUser = async (
  userId,
  {
    type,
    title,
    message,
    link = null,
    image = null,
    meta = {},
    isRead = false,
  },
) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type,
      title,
      message,
      link,
      image,
      meta,
      isRead,
    });
    emitToUser(userId, "notification:new", notification);
    return notification;
  } catch (err) {
    console.error("notifyUser error:", err);
    return null;
  }
};

exports.notifyAdmins = async ({
  type,
  title,
  message,
  link = null,
  image = null,
  meta = {},
  readByAdminIds = [],
}) => {
  try {
    const notification = await Notification.create({
      isGlobal: true,
      audience: "admin",
      type,
      title,
      message,
      link,
      image,
      meta,
      readBy: readByAdminIds,
    });
    emitToAdmins("notification:new", notification);
    return notification;
  } catch (err) {
    console.error("notifyAdmins error:", err);
    return null;
  }
};