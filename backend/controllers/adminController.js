const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { errorHandler } = require('../utils/errorHandler');

// Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {
        console.log("working");
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get counts
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();

        // Get total revenue
        const revenue = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['cancelled', 'refunded'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        // Get low stock products
        const lowStockProducts = await Product.find({ stockQuantity: { $lt: 10 } })
            .sort({ stockQuantity: 1 })
            .limit(5)
            .populate('category', 'name')
            .lean();

        // Return all stats
        res.json({
            success: true,
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            token 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Additional admin controllers can be added here
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire');

        res.json({
            success: true,
            users
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.getUserById = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Check if user is trying to delete themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
}; 