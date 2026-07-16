const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({
    stripeSessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            name: String,
            sku: String,
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            size: String,
            color: String,
            image: String,
            customization: {
                text: String,
                design: String,
                position: String
            }
        }
    ],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    phone: String,
    itemsPrice: Number,
    discountAmount: Number,
    couponCode: { type: String, default: null },
    shippingPrice: Number,
    taxPrice: Number,
    totalPrice: Number,
    orderNotes: String,
    createdAt: { type: Date, default: Date.now, expires: 3600 }
});

module.exports = mongoose.models.PendingOrder || mongoose.model('PendingOrder', pendingOrderSchema);