/**
 * Seeds ~60 realistic orders across every status combination so the admin
 * Order Management page has something interesting to filter/search/paginate.
 *
 * Usage:
 *   node scripts/seedOrders.js
 *
 * Requires MONGODB_URI in your .env (same one server.js uses), and at least
 * one User + one Product already in the database — it borrows real ids from
 * whatever is there instead of inventing fake refs.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../../frontend/src/app/admin-order-management/backend/models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinLastDays(days) {
    const now = Date.now();
    const past = now - Math.random() * days * 24 * 60 * 60 * 1000;
    return new Date(past);
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({ role: { $ne: 'admin' } }).limit(15).lean();
    const products = await Product.find().limit(20).lean();

    if (users.length === 0 || products.length === 0) {
        console.error('❌ Need at least one non-admin User and one Product in the DB before seeding orders.');
        process.exit(1);
    }

    const orders = [];

    for (let i = 0; i < 60; i++) {
        const user = randomFrom(users);
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const orderItems = [];
        let itemsPrice = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = randomFrom(products);
            const quantity = 1 + Math.floor(Math.random() * 3);
            const price = product.price || 19.99;
            itemsPrice += price * quantity;

            orderItems.push({
                product: product._id,
                name: product.name || 'T-Shirt',
                sku: product.sku || `SKU-${product._id.toString().slice(-6).toUpperCase()}`,
                quantity,
                price,
                size: randomFrom(['S', 'M', 'L', 'XL']),
                color: randomFrom(['Black', 'White', 'Navy', 'Heather Grey']),
                image: (product.images && product.images[0]) || ''
            });
        }

        const shippingPrice = itemsPrice > 75 ? 0 : 6.99;
        const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
        const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

        const orderStatus = randomFrom(ORDER_STATUSES);
        let paymentStatus = randomFrom(PAYMENT_STATUSES);
        // Keep data sane: cancelled orders are rarely "paid" with no refund noted
        if (orderStatus === 'cancelled' && paymentStatus === 'paid') paymentStatus = 'refunded';

        const createdAt = randomDateWithinLastDays(45);

        orders.push({
            user: user._id,
            orderItems,
            shippingAddress: {
                street: '123 Main St',
                city: randomFrom(['Dhaka', 'Chittagong', 'Sylhet', 'Khulna']),
                state: 'N/A',
                postalCode: '1200',
                country: 'Bangladesh'
            },
            phone: '+8801' + Math.floor(100000000 + Math.random() * 800000000),
            paymentMethod: randomFrom(['Card', 'bKash', 'Cash on Delivery']),
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: paymentStatus === 'paid',
            paidAt: paymentStatus === 'paid' ? createdAt : undefined,
            isDelivered: orderStatus === 'delivered',
            deliveredAt: orderStatus === 'delivered' ? createdAt : undefined,
            orderStatus,
            paymentStatus,
            internalNotes: '',
            createdAt,
            updatedAt: createdAt
        });
    }

    // Insert one at a time so the pre-save hook assigns sequential orderNumbers
    for (const orderData of orders) {
        await Order.create(orderData);
    }

    console.log(`✅ Seeded ${orders.length} mock orders`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
