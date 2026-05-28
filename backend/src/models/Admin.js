const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
      type: String,
      required() {
        return !this.provider || this.provider === 'local';
      },
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required() {
        return !this.provider || this.provider === 'local';
      }
    },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
