const express = require('express');
const { auth, admin } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/booking', auth, bookingController.createBooking);
router.get('/booking/:userId', auth, bookingController.getUserBookings);

router.get('/admin/bookings', auth, admin, bookingController.getAllBookings);

module.exports = router;
