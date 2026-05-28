const express = require('express');
const auth = require('../middleware/auth');
const {
  sendOtp,
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  me,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, me);
router.put('/me', auth, updateProfile);

module.exports = router;