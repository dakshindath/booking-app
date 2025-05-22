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
    // If no userId provided, use the logged-in user's ID
    const userId = req.params.userId || req.user.id;

    // Check authorization
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Find bookings for the user and populate listing details
    const bookings = await Booking.find({ user: userId }).populate('listing');
    res.json(bookings);
  } catch (err) {
    console.error('Error getting user bookings:', err);
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

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the user or user is admin
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Validate status
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
