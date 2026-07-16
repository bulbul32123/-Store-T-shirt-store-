/**
 * Seeds exactly 5 deterministic mock orders — one for each fulfillment
 * stage — so you can manually click through every feature of the Order
 * Management page without sifting through random data.
 *
 * Drop this into backend/scripts/ and run:
 *   node scripts/seedFiveMockOrders.js
 *
 * Requires at least one non-admin User and one Product already in your DB
 * (it borrows their real ids — no fake refs).
 *
 * This is ADDITIVE — it does not delete existing orders. If you want a
 * clean slate first, run this in your mongo shell / Compass:
 *   db.orders.deleteMany({})
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

function daysAgo(n) {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({ role: { $ne: 'admin' } }).limit(3).lean();
    const products = await Product.find().limit(5).lean();

    if (users.length === 0 || products.length === 0) {
        console.error('❌ Need at least one non-admin User and one Product in the DB first.');
        process.exit(1);
    }

    const buyer = (i) => users[i % users.length];
    const item = (i, qty = 1) => {
        const p = products[i % products.length];
        return {
            product: p._id,
            name: p.name || 'T-Shirt',
            sku: p.sku || `SKU-${p._id.toString().slice(-6).toUpperCase()}`,
            quantity: qty,
            price: p.price || 24.99,
            size: ['S', 'M', 'L', 'XL'][i % 4],
            color: ['Black', 'White', 'Navy', 'Heather Grey'][i % 4],
            image: (p.images && p.images[0]) || ''
        };
    };
    const address = (city) => ({
        street: '12 Gulshan Avenue',
        city,
        state: 'Dhaka Division',
        postalCode: '1212',
        country: 'Bangladesh'
    });

    const mockOrders = [
        {
            // 1. Brand new order, nothing happened to it yet.
            label: 'Pending / Unpaid',
            user: buyer(0)._id,
            orderItems: [item(0, 2)],
            shippingAddress: address('Dhaka'),
            phone: '+8801711000001',
            paymentMethod: 'Cash on Delivery',
            itemsPrice: 49.98,
            taxPrice: 4.0,
            shippingPrice: 6.99,
            totalPrice: 60.97,
            orderStatus: 'pending',
            paymentStatus: 'unpaid',
            internalNotes: '',
            createdAt: daysAgo(0)
        },
        {
            // 2. Paid and being prepared. Has a billing address that differs
            //    from shipping, and a pre-filled internal note.
            label: 'Processing / Paid',
            user: buyer(1)._id,
            orderItems: [item(1, 1), item(2, 1)],
            shippingAddress: address('Chattogram'),
            billingAddress: address('Dhaka'),
            phone: '+8801711000002',
            paymentMethod: 'Card',
            itemsPrice: 89.5,
            taxPrice: 7.16,
            shippingPrice: 0,
            totalPrice: 96.66,
            isPaid: true,
            paidAt: daysAgo(3),
            orderStatus: 'processing',
            paymentStatus: 'paid',
            internalNotes: 'Customer requested gift wrap — add note in the box.',
            createdAt: daysAgo(3)
        },
        {
            // 3. Shipped, has a tracking number, no phone on file
            //    (tests the "Not provided" fallback in the drawer).
            label: 'Shipped / Paid',
            user: buyer(2)._id,
            orderItems: [item(3, 3)],
            shippingAddress: address('Sylhet'),
            paymentMethod: 'bKash',
            itemsPrice: 74.97,
            taxPrice: 6.0,
            shippingPrice: 6.99,
            totalPrice: 87.96,
            isPaid: true,
            paidAt: daysAgo(7),
            orderStatus: 'shipped',
            paymentStatus: 'paid',
            trackingNumber: 'USPS-TRK-99281734',
            internalNotes: '',
            createdAt: daysAgo(7)
        },
        {
            // 4. Fully delivered, 3 line items (good test for the
            //    product-breakdown table scrolling/layout).
            label: 'Delivered / Paid',
            user: buyer(0)._id,
            orderItems: [item(4, 1), item(0, 1), item(1, 2)],
            shippingAddress: address('Khulna'),
            phone: '+8801711000004',
            paymentMethod: 'Card',
            itemsPrice: 149.95,
            taxPrice: 12.0,
            shippingPrice: 0,
            totalPrice: 161.95,
            isPaid: true,
            paidAt: daysAgo(14),
            isDelivered: true,
            deliveredAt: daysAgo(10),
            orderStatus: 'delivered',
            paymentStatus: 'paid',
            internalNotes: 'Delivered two days early — customer left 5-star review.',
            createdAt: daysAgo(14)
        },
        {
            // 5. Cancelled and refunded — exercises the red/purple badges
            //    and the "Refunded/Cancelled" summary card.
            label: 'Cancelled / Refunded',
            user: buyer(1)._id,
            orderItems: [item(2, 1)],
            shippingAddress: address('Rajshahi'),
            phone: '+8801711000005',
            paymentMethod: 'Card',
            itemsPrice: 39.99,
            taxPrice: 3.2,
            shippingPrice: 6.99,
            totalPrice: 50.18,
            isPaid: false,
            orderStatus: 'cancelled',
            paymentStatus: 'refunded',
            internalNotes: 'Customer cancelled — wrong size ordered. Refund issued.',
            createdAt: daysAgo(20)
        }
    ];

    console.log('\nCreating 5 mock orders:\n');
    for (const { label, ...orderData } of mockOrders) {
        const order = await Order.create(orderData);
        console.log(`  #ORD-${order.orderNumber}  →  ${label}  ($${order.totalPrice.toFixed(2)})`);
    }

    console.log('\n✅ Done. Refresh /admin/orders to see them.\n');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});