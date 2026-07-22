const Coupon = require('../models/Coupon');

function generateRewardCode() {
    return `THANKS${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

exports.createRewardCoupon = async (userId) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    return Coupon.create({
        code: generateRewardCode(),
        description: 'Loyalty reward for orders over $200',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 30,
        minPurchaseAmount: 0,
        usageLimit: 1,
        perUserLimit: 1,
        expiryDate,
        isActive: true,
        exclusiveToUser: userId,
        isReward: true
    });
};

exports.getMyRewards = async (req, res) => {
    try {
        const now = new Date();
        const rewards = await Coupon.find({
            exclusiveToUser: req.user.id,
            isActive: true,
            expiryDate: { $gte: now },
            $expr: { $lt: ['$usedCount', { $ifNull: ['$usageLimit', 1] }] }
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: rewards });
    } catch (error) {
        console.error('Get my rewards error:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching rewards' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            minPurchaseAmount,
            usageLimit,
            perUserLimit,
            startDate,
            expiryDate,
            isActive,
            applicableCategories,
            applicableProducts
        } = req.body;

        if (!code || !discountType || discountValue === undefined || discountValue === null || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Code, discount type, discount value, and expiry date are required'
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const existing = await Coupon.findOne({ code: normalizedCode });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `A coupon with code "${normalizedCode}" already exists`
            });
        }

        const coupon = await Coupon.create({
            code: normalizedCode,
            description,
            discountType,
            discountValue,
            maxDiscountAmount: maxDiscountAmount || null,
            minPurchaseAmount: minPurchaseAmount || 0,
            usageLimit: usageLimit || null,
            perUserLimit: perUserLimit || null,
            startDate: startDate || Date.now(),
            expiryDate,
            isActive: isActive !== undefined ? isActive : true,
            applicableCategories: applicableCategories || [],
            applicableProducts: applicableProducts || [],
            createdBy: req.user?._id
        });

        return res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        console.error('Create coupon error:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating coupon' });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;

        const query = {};

        if (search) {
            query.code = { $regex: search, $options: 'i' };
        }

        if (status === 'active') {
            query.isActive = true;
            query.expiryDate = { $gte: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            query.expiryDate = { $lt: new Date() };
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.max(parseInt(limit, 10) || 20, 1);
        const skip = (pageNum - 1) * limitNum;

        const [coupons, total] = await Promise.all([
            Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Coupon.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            count: coupons.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1,
            data: coupons
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching coupons' });
    }
};

exports.toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            data: coupon
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
        }
        console.error('Toggle coupon status error:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating coupon status' });
    }
};
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
            data: { id: req.params.id }
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
        }
        console.error('Delete coupon error:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting coupon' });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }
        if (subtotal === undefined || subtotal === null || subtotal < 0) {
            return res.status(400).json({ success: false, message: 'Valid subtotal is required' });
        }

        const normalizedCode = code.trim().toUpperCase();
        const coupon = await Coupon.findOne({ code: normalizedCode });
if (coupon.exclusiveToUser && coupon.exclusiveToUser.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'This coupon is not valid for your account' });
        }
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
        }

        const now = new Date();
        if (coupon.startDate && coupon.startDate > now) {
            return res.status(400).json({ success: false, message: 'This coupon is not active yet' });
        }
        if (coupon.expiryDate && coupon.expiryDate < now) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }

        if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
        }

        if (subtotal < coupon.minPurchaseAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of $${coupon.minPurchaseAmount} required for this coupon`
            });
        }

        if (coupon.perUserLimit != null && req.user) {
            const userUsageCount = req.user.usedCoupons?.filter(
                (u) => u.code === normalizedCode
            ).length || 0;

            if (userUsageCount >= coupon.perUserLimit) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon the maximum number of times' });
            }
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount != null) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        discountAmount = Math.min(+discountAmount.toFixed(2), subtotal);

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        return res.status(500).json({ success: false, message: 'Server error while validating coupon' });
    }
};