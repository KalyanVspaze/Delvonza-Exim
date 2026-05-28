const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { sendOtpEmail } = require('../services/mailService');

const User = require('../models/User');

const {
  signAccessToken,
  signRefreshToken
} = require('../utils/token');

// ================= OTP STORE =================

// Temporary Memory Store
const otpStore = {};

// ================= SANITIZE USER =================

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address
});

// ================= SEND OTP =================

const sendOtp = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    // Save OTP
    otpStore[email] = otp;

    console.log('Generated OTP:', otp);


    // ================= SEND EMAIL =================

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully.'
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP.'
    });
  }
};

// ================= REGISTER =================

const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      phone = '',
      address = '',
      otp
    } = req.body;

    // ================= VALIDATIONS =================

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        message: 'Name, email, password and OTP are required.'
      });
    }

    if (!String(phone).trim()) {
      return res.status(400).json({
        message: 'Phone number is required.'
      });
    }

    if (!String(address).trim()) {
      return res.status(400).json({
        message: 'Address is required.'
      });
    }

    // ================= CHECK EXISTING USER =================

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered.'
      });
    }

    // ================= VERIFY OTP =================

    if (otpStore[email] !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP.'
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= CREATE USER =================

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim()
    });

    // ================= CREATE TOKENS =================

    const accessToken = signAccessToken(user._id.toString());

    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokens.push(refreshToken);

    await user.save();

    // Remove OTP after success
    delete otpStore[email];

    return res.status(201).json({
      message: 'Registered successfully.',
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: 'Failed to register user.'
    });
  }
};

// ================= LOGIN =================

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    const accessToken = signAccessToken(
      user._id.toString()
    );

    const refreshToken = signRefreshToken(
      user._id.toString()
    );

    user.refreshTokens.push(refreshToken);

    await user.save();

    return res.json({
      message: 'Login successful.',
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to login.'
    });
  }
};

// ================= REFRESH TOKEN =================

const refreshToken = async (req, res) => {

  try {

    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Refresh token is required.'
      });
    }

    let decoded;

    try {

      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );

    } catch (error) {

      return res.status(401).json({
        message: 'Invalid refresh token.'
      });
    }

    const user = await User.findById(
      decoded.userId
    );

    if (
      !user ||
      !user.refreshTokens.includes(token)
    ) {
      return res.status(401).json({
        message: 'Refresh token is not valid.'
      });
    }

    const accessToken = signAccessToken(
      user._id.toString()
    );

    return res.json({
      accessToken
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to refresh token.'
    });
  }
};

// ================= FORGOT PASSWORD OTP STORE =================

const forgotPasswordStore = {};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // ================= FIND USER =================

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // ================= GENERATE OTP =================

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    // ================= SAVE OTP =================

    forgotPasswordStore[email] = otp;

    console.log('Forgot Password OTP:', otp);

    // ================= SEND EMAIL =================

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email.'
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP.'
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {

  try {

    const {
      email,
      otp,
      newPassword
    } = req.body;

    // ================= VALIDATIONS =================

    if (!email || !otp || !newPassword) {

      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // ================= FIND USER =================

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // ================= VERIFY OTP =================

    if (forgotPasswordStore[email] !== otp) {

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.'
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // ================= UPDATE PASSWORD =================

    user.password = hashedPassword;

    await user.save();

    // ================= DELETE OTP =================

    delete forgotPasswordStore[email];

    return res.status(200).json({
      success: true,
      message: 'Password reset successful.'
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Reset password failed.'
    });
  }
};

// ================= LOGOUT =================

const logout = async (req, res) => {

  try {

    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(200).json({
        message: 'Logged out.'
      });
    }

    const decoded = jwt.decode(token);

    if (!decoded?.userId) {
      return res.status(200).json({
        message: 'Logged out.'
      });
    }

    await User.findByIdAndUpdate(
      decoded.userId,
      {
        $pull: {
          refreshTokens: token
        }
      }
    );

    return res.status(200).json({
      message: 'Logged out.'
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to logout.'
    });
  }
};

// ================= ME =================

const me = async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    return res.json({
      user: sanitizeUser(user)
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to fetch profile.'
    });
  }
};

// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {

  try {

    const {
      name,
      phone = '',
      address = ''
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required.'
      });
    }

    user.name = name.trim();
    user.phone = phone.trim();
    user.address = address.trim();

    await user.save();

    return res.json({
      message: 'Profile updated.',
      user: sanitizeUser(user)
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to update profile.'
    });
  }
};

module.exports = {
  sendOtp,
  register,
  login,
  refreshToken,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword
};