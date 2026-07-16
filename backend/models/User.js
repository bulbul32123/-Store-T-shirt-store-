
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const noteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        default: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
    type: String,
    trim: true,
    default: ''
},
    gender:{
        type: String,
        enum: ['male', 'female', 'other'],
        default: ''
    },
     dateOfBirth: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
        url: String,
        public_id: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    phoneNumber: String,
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    usedCoupons: [{
        coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        code: String,
        usedAt: { type: Date, default: Date.now }
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        size: String,
        color: String,
        customization: {
            text: String,
            design: String,
            position: String
        }
    }],

avatar: {
    type: String,
    default: ''
},

status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
},

location: {
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    }
},

segment: {
    type: String,
    enum: ['regular', 'repeat_buyer', 'high_spender', 'inactive'],
    default: 'regular'
},

notes: [noteSchema],

lastOrderDate: {
    type: Date
},
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
userSchema.index({ role: 1, status: 1 });
userSchema.index({ role: 1, segment: 1 });
userSchema.index({ role: 1, createdAt: -1 });

userSchema.index({
    name: 'text',
    email: 'text',
    phone: 'text'
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 