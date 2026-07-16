
let io = null;

exports.initSocket = (ioInstance) => {
    io = ioInstance;
};

exports.emitToUser = (userId, event, payload) => {
    if (!io) return;
    io.to(`user_${userId}`).emit(event, payload);
};

exports.emitToUsers = (userIds, event, payload) => {
    if (!io) return;
    userIds.forEach((id) => io.to(`user_${id}`).emit(event, payload));
};

exports.emitGlobal = (event, payload) => {
    if (!io) return;
    io.emit(event, payload);
};

exports.emitToAdmins = (event, payload) => {
    if (!io) return;
    io.to('admins').emit(event, payload);
};