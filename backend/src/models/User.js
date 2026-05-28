const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required() {
        return !this.provider || this.provider === 'local';
      }
    },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    refreshTokens: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
