const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isHost: { type: Boolean, default: false },
  hostSince: { type: Date },
  hostInfo: {
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
    identification: { type: String }, // Document ID or verification info
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
