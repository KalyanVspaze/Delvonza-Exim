const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const initializePassport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminOauthRoutes = require('./routes/adminOauthRoutes');
const { checkEmailHealth } = require('./controllers/healthController');

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000,http://localhost:3001'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Backend is running.' });
});

app.get('/api/health/email', checkEmailHealth);

initializePassport();
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/auth', adminOauthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/settings', siteSettingsRoutes);

module.exports = app;
