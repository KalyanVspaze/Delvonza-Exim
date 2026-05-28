const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/oauthController');

const router = express.Router();

router.get('/google', passport.authenticate('google-user', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google-user', { session: false, failureRedirect: '/api/auth/google/failure' }),
  googleAuthCallback
);

router.get('/google/failure', (_req, res) => {
  res.status(400).json({ message: 'Google OAuth login failed.' });
});

module.exports = router;
