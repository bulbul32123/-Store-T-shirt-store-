const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
        ensureAdmin();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });


// Add this for better error handling
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});
// Import User model at the top
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Function to ensure at least one admin exists
async function ensureAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin@1234', 10);

            const admin = await User.create({
                name: 'Super Admin',
                email: 'admin@tshirtstore.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });

            console.log('✅ Default Admin created:');
            console.log('   Email: admin@ekart.com');
            console.log('   Password: Admin@1234');
        } else {
            console.log(`⚡ Admin already exists: ${adminExists.email}`);
        }
    } catch (err) {
        console.error('Error ensuring admin exists:', err);
    }
}


// Add these to your middleware section
app.use((req, res, next) => {
    // Log all requests
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/categories', require('./routes/categories'));
const uploadRoutes = require('./routes/upload');

// Enable cookie parsing

// Use routes
app.use('/api/upload', uploadRoutes);

// API Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Add this after your routes
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Add this near the beginning of your server.js
console.log('ENVIRONMENT CHECK:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET ✓' : 'MISSING ✗');
console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? 'SET ✓' : 'MISSING ✗');
console.log('Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET ✓' : 'MISSING ✗');




// Work on Admin Dashboard

// cd frontend
// npm run dev
// cd backend
// npm run dev