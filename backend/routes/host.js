const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const { auth, admin } = require('../middleware/auth');

// Apply to become a host
router.post('/apply', auth, hostController.applyToBeHost);

// Get own host profile
router.get('/profile', auth, hostController.getHostProfile);

// Get specific host profile
router.get('/profile/:id', auth, hostController.getHostProfile);

// Get host's listings
router.get('/listings', auth, hostController.getHostListings);

// Get host's bookings
router.get('/bookings', auth, hostController.getHostBookings);

// Delete a host's listing
router.delete('/listings/:id', auth, hostController.deleteHostListing);

// Admin routes for managing hosts
router.get('/applications', auth, admin, hostController.getPendingHostApplications);
router.post('/applications/review', auth, admin, hostController.reviewHostApplication);

module.exports = router;
