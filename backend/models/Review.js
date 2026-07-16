
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product reference is required']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required']
        },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Min rating is 1'],
            max: [5, 'Max rating is 5']
        },
        reviewText: {
            type: String,
            required: [true, 'Review text is required'],
            trim: true,
            maxlength: [1000, 'Review text cannot exceed 1000 characters']
        },
      

        sizePurchased:  { type: String, trim: true },
        colorPurchased: { type: String, trim: true },
        fitFeedback: {
            type: String,
            enum: ['Too Small', 'True to Size', 'Too Large']
        },

        images: {
            type: [{ url: { type: String, required: true }, public_id: String }],
            validate: {
                validator: (arr) => arr.length <= 3,
                message: 'Maximum 3 images per review'
            },
            default: []
        },
        video: { url: String, public_id: String },

        isAnonymous:      { type: Boolean, default: false },
        verifiedPurchase: { type: Boolean, default: false },

        likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    reports: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:   { type: String, required: true, maxlength: 100 },  
    details: { type: String, maxlength: 500 },                    
    createdAt: { type: Date, default: Date.now }
}],

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        moderatedAt: Date
    },
    { timestamps: true }
);

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ reviewText: 'text' });

module.exports = mongoose.model('Review', reviewSchema);