//wishlist.js
const express = require('express');
const router = express.Router();
const { syncCart, getCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { syncWishlist, getWishlist } = require('../controllers/wishlistController');

router.put('/sync', protect, syncWishlist);
router.get('/', protect, getWishlist);

module.exports = router;