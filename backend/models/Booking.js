const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
