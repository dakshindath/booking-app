const Booking = require('../models/Booking');


exports.createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate, guests, totalPrice } = req.body;
    const booking = new Booking({
      user: req.user.id,
      listing: listingId,
      startDate,
      endDate,
      guests,
      totalPrice,
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const bookings = await Booking.find({ user: req.params.userId }).populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
