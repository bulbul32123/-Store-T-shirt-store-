require('dotenv').config();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirt-store';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_jwt_secret_not_for_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const CLOUDINARY_CONFIG = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

const EMAIL_CONFIG = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME || '',
        pass: process.env.EMAIL_PASSWORD || ''
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
};

if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email credentials missing. Email sending is disabled.');
}

const DEFAULT_PAGE_SIZE = 10;

module.exports = {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRE,
    CLIENT_URL,
    CLOUDINARY_CONFIG,
    EMAIL_CONFIG,
    DEFAULT_PAGE_SIZE
}; 