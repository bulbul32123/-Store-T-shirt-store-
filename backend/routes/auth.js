const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); 
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
