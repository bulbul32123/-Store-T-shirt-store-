
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 } 
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      sku: String,
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity cannot be less than 1"],
      },
      price: {
        type: Number,
        required: true,
      },
      size: String,
      color: String,
      image: String,
      customization: {
        text: String,
        design: String,
        position: String,
      },
    },
  ],

  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },

  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  phone: String,

  paymentMethod: {
    type: String,
    required: true,
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  stripeSessionId: {
    type: String,
    default: null,
    index: true,
  },

  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },

  isPaid: { type: Boolean, required: true, default: false },
  paidAt: Date,
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed", "refunded"],
    default: "unpaid",
  },

  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: Date,
  trackingNumber: String,
  orderStatus: {
    type: String,
    enum: [
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  isArchived: { type: Boolean, default: false }, 
  archivedAt: { type: Date, default: null },
  statusHistory: [
    {
      status: { type: String, required: true },
      note: { type: String, default: "" },
      changedAt: { type: Date, default: Date.now },
    },
  ],

  orderNotes: String,
  internalNotes: { type: String, default: "" },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  discountAmount: { type: Number, required: true, default: 0.0 },
  couponCode: { type: String, default: null },
  taxPrice: { type: Number, required: true, default: 0.0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', async function (next) {
    this.updatedAt = Date.now();
    if (this.isModified('isPaid') && !this.isModified('paymentStatus')) {
        this.paymentStatus = this.isPaid ? 'paid' : 'unpaid';
    }
    if (this.isModified('paymentStatus')) {
        this.isPaid = this.paymentStatus === 'paid';
        if (this.isPaid && !this.paidAt) this.paidAt = new Date();
    }
    if (this.isNew && this.orderNumber == null) {
        const counter = await Counter.findByIdAndUpdate(
            'orderNumber',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.orderNumber = counter.seq;
    }

    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.Counter = Counter;
