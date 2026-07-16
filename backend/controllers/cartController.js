const User = require('../models/User');

exports.syncCart = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'items must be an array' });
        }

        const cart = items
            .filter((i) => i.product)
            .map((i) => ({
                product: i.product,
                quantity: Math.max(1, Number(i.quantity) || 1),
                size: i.size || undefined,
                color: i.color || undefined,
                customization: i.customization || undefined,
            }));

        const user = await User.findByIdAndUpdate(req.user.id, { cart }, { new: true }).select('cart');

        res.json({ success: true, message: 'Cart synced', cart: user.cart });
    } catch (err) {
        console.error('Cart sync error:', err);
        res.status(500).json({ success: false, message: 'Server error syncing cart' });
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('cart').populate('cart.product');
        res.json({ success: true, cart: user.cart });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching cart' });
    }
};