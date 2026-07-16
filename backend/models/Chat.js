
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "admin"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "resolved", "closed"],
    default: "active",
  },
  messages: [messageSchema],
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  unreadByAdmin: {
    
    type: Number,
    default: 0,
  },
  unreadByUser: {
    
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.index({ status: 1, lastUpdated: -1 }); 


chatSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;