const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  availability: [{
    start: { type: Date },
    end: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Listing', listingSchema);
