const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken } = require('../utils/token');
const { signAdminAccessToken } = require('../utils/adminToken');

const redirectWithTokens = (res, redirectUrl, tokens) => {
  const url = new URL(redirectUrl);
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  res.redirect(url.toString());
};

const frontendOAuthRedirect = process.env.FRONTEND_OAUTH_REDIRECT || 'http://localhost:3000/oauth/callback';
const adminOAuthRedirect = process.env.ADMIN_OAUTH_REDIRECT || 'http://localhost:3001/oauth/callback';

const googleAuthCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${frontendOAuthRedirect}?error=oauth_failed`);
  }

  const accessToken = signAccessToken(req.user._id.toString());
  const refreshToken = signRefreshToken(req.user._id.toString());
  req.user.refreshTokens = req.user.refreshTokens || [];
  req.user.refreshTokens.push(refreshToken);
  await req.user.save();

  redirectWithTokens(res, frontendOAuthRedirect, { accessToken, refreshToken, type: 'user' });
};

const googleAdminAuthCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${adminOAuthRedirect}?error=oauth_failed`);
  }

  const accessToken = signAdminAccessToken(req.user._id.toString());
  redirectWithTokens(res, adminOAuthRedirect, { accessToken, type: 'admin' });
};

module.exports = { googleAuthCallback, googleAdminAuthCallback, frontendOAuthRedirect, adminOAuthRedirect };
