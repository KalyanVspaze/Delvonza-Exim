const express = require('express');
const passport = require('passport');
const { googleAdminAuthCallback } = require('../controllers/oauthController');

const router = express.Router();

router.get('/google', passport.authenticate('google-admin', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google-admin', { session: false, failureRedirect: '/api/admin/auth/google/failure' }),
  googleAdminAuthCallback
);

router.get('/google/failure', (_req, res) => {
  res.status(400).json({ message: 'Google OAuth admin login failed.' });
});

module.exports = router;
