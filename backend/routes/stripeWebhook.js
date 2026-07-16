const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/orderController');

router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;