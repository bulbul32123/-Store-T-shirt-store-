//server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { initSocket } = require('./utils/socket');

const fs = require('fs');
dotenv.config();
const app = express();

app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use('/api/stripe/webhook', require('./routes/stripeWebhook'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
        ensureAdmin();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});


const User = require('./models/User');
const bcrypt = require('bcryptjs');
async function ensureAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const admin = await User.create({
                name: 'Super Admin',
                email: 'admin@tshirtstore.com',
                password: 'Admin123456',
                role: 'admin',
                isVerified: true
            });


            console.log('✅ Default Admin created:');
            console.log('   Email: admin@tshirtstore.com');
            console.log('   Password: Admin123456');
        } else {
            console.log(`⚡ Admin already exists: ${adminExists.email}`);
        }
    } catch (err) {
        console.error('Error ensuring admin exists:', err);
    }
}

function parseCookieHeader(cookieHeader = '') {
    return Object.fromEntries(
        cookieHeader.split(';')
            .map((c) => c.trim().split('='))
            .filter((pair) => pair.length === 2)
            .map(([k, v]) => [k, decodeURIComponent(v)])
    );
}
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/storeReviews')); 
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/coupons', require('./routes/coupons'));
const uploadRoutes = require('./routes/upload');

app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    },
});

io.use((socket, next) => {
    try {
        const cookies = parseCookieHeader(socket.handshake.headers.cookie);
        const token = cookies.token;

        if (!token) return next(new Error('Not authorized'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role || null;
        next();
    } catch (err) {
        next(new Error('Not authorized'));
    }
});

io.on('connection', (socket) => {
    socket.join(`user_${socket.userId}`);
    if (socket.userRole === 'admin') {
        socket.join('admins');
    }

    socket.on('disconnect', () => {
        // no-op — room membership is cleaned up automatically
    });
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running`);
});