
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        "new_product",
        "discount",
        "coupon",
        "review_added",
        "order_update",
        "system",
        "review_deleted",
        "new_order",
        "new_customer",
        "review_reported",
        "chat_message",
        "order_cancelled",
      ],
      required: true,
    },
    audience: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: null, 
    },
    image: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);