
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            trim: true,
            uppercase: true,
            minlength: [3, 'Coupon code must be at least 3 characters'],
            maxlength: [20, 'Coupon code cannot exceed 20 characters']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        discountType: {
            type: String,
            enum: {
                values: ['percentage', 'fixed'],
                message: 'Discount type must be either "percentage" or "fixed"'
            },
            required: [true, 'Discount type is required']
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative'],
            validate: {
                validator: function (value) {
                    if (this.discountType === 'percentage') return value <= 100;
                    return true;
                },
                message: 'Percentage discount cannot exceed 100'
            }
        },
    
        maxDiscountAmount: {
            type: Number,
            min: [0, 'Max discount amount cannot be negative'],
            default: null
        },
        minPurchaseAmount: {
            type: Number,
            min: [0, 'Minimum purchase amount cannot be negative'],
            default: 0
        },
    
        usageLimit: {
            type: Number,
            min: [1, 'Usage limit must be at least 1'],
            default: null
        },
        exclusiveToUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        isReward: {
            type: Boolean,
            default: false
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0
        },
    
        perUserLimit: {
            type: Number,
            min: [1, 'Per-user limit must be at least 1'],
            default: null
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date,
            required: [true, 'Expiry date is required'],
            validate: {
                validator: function (value) {
                    return !this.startDate || value > this.startDate;
                },
                message: 'Expiry date must be after the start date'
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
    
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            }
        ],
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

couponSchema.virtual('status').get(function () {
    if (!this.isActive) return 'inactive';
    if (this.expiryDate && this.expiryDate < new Date()) return 'expired';
    if (this.usageLimit != null && this.usedCount >= this.usageLimit) return 'exhausted';
    return 'active';
});

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

module.exports = Coupon;