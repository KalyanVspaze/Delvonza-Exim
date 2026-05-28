const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

const createOrUpdateUser = async (profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) {
    throw new Error('Google account has no email');
  }

  const providerId = profile.id;
  const existing = await User.findOne({ $or: [{ providerId }, { email }] });

  if (existing) {
    existing.provider = 'google';
    existing.providerId = providerId;
    existing.avatar = profile.photos?.[0]?.value || existing.avatar;
    if (!existing.password) {
      existing.password = await bcrypt.hash(`google:${providerId}`, 10);
    }
    await existing.save();
    return existing;
  }

  const passwordHash = await bcrypt.hash(`google:${providerId}`, 10);
  return User.create({
    name: profile.displayName || email.split('@')[0],
    email,
    password: passwordHash,
    provider: 'google',
    providerId,
    avatar: profile.photos?.[0]?.value || '',
    phone: '',
    address: ''
  });
};

const findAdminByGoogle = async (profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) {
    throw new Error('Google account has no email');
  }

  let admin = await Admin.findOne({ email });
  if (!admin) {
    const username = profile.displayName || email.split('@')[0];
    const passwordHash = await bcrypt.hash(`google:${profile.id}`, 10);
    admin = await Admin.create({
      username: username.trim(),
      email,
      phone: profile.phoneNumbers?.[0]?.value?.replace(/\D/g, '') || '',
      password: passwordHash,
      provider: 'google',
      providerId: profile.id
    });
    return admin;
  }

  admin.provider = 'google';
  admin.providerId = profile.id;
  if (!admin.password) {
    admin.password = await bcrypt.hash(`google:${profile.id}`, 10);
  }
  await admin.save();
  return admin;
};

const initializePassport = () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!googleClientId || !googleClientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for Google OAuth');
  }

  passport.use(
    'google-user',
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await createOrUpdateUser(profile);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    'google-admin',
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL:
          process.env.GOOGLE_ADMIN_CALLBACK_URL || 'http://localhost:5000/api/admin/auth/google/callback'
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const admin = await findAdminByGoogle(profile);
          return done(null, admin);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

module.exports = initializePassport;
