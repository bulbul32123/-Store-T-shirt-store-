const Notification = require('../models/Notification');

/**
 * Fire a notification visible to every user (new product, store-wide
 * discount, new coupon). One document is created regardless of user count.
 */
exports.notifyAll = async ({ type, title, message, link = null, image = null, meta = {} }) => {
    try {
        return await Notification.create({
            isGlobal: true,
            type,
            title,
            message,
            link,
            image,
            meta,
        });
    } catch (err) {
        console.error('notifyAll error:', err);
        return null;
    }
};

/**
 * Fire a notification for a single user (e.g. a review was added to a
 * product they own, an order status changed).
 */
exports.notifyUser = async (userId, { type, title, message, link = null, image = null, meta = {} }) => {
    try {
        return await Notification.create({
            recipient: userId,
            type,
            title,
            message,
            link,
            image,
            meta,
        });
    } catch (err) {
        console.error('notifyUser error:', err);
        return null;
    }
};

/**
 * Fire the same notification to many specific users at once
 * (e.g. everyone who purchased a product that just got a new review).
 */
exports.notifyUsers = async (userIds, payload) => {
    try {
        const docs = userIds.map((id) => ({ recipient: id, ...payload }));
        return await Notification.insertMany(docs);
    } catch (err) {
        console.error('notifyUsers error:', err);
        return null;
    }
};