const User = require('../models/User');

exports.syncWishlist = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds)) {
            return res.status(400).json({ success: false, message: 'productIds must be an array' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { wishlist: productIds },
            { new: true }
        ).select('wishlist');

        res.json({ success: true, message: 'Watchlist synced', wishlist: user.wishlist });
    } catch (err) {
        console.error('Wishlist sync error:', err);
        res.status(500).json({ success: false, message: 'Server error syncing watchlist' });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('wishlist').populate('wishlist');
        res.json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching watchlist' });
    }
};