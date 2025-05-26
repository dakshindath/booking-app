const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const listingController = require('../controllers/listingController');

const router = express.Router();

// User management
router.get('/users', auth, admin, adminController.getAllUsers);
router.get('/hosts', auth, admin, adminController.getAllHosts);
router.delete('/user/:id', auth, admin, adminController.deleteUser);

// Host management
router.put('/host/:id/approve', auth, admin, adminController.approveHostApplication);
router.put('/host/:id/revoke', auth, admin, adminController.revokeHostStatus);

// Booking management
router.put('/booking/:id', auth, admin, adminController.updateBookingStatus);

// Dashboard stats
router.get('/dashboard/stats', auth, admin, adminController.getDashboardStats);

// Listing management
router.get('/listings', auth, admin, adminController.getListingsWithBookingCounts);
router.get('/listings/pending', auth, admin, listingController.getPendingListings);
router.post('/listing', auth, admin, listingController.createListingAsAdmin);
router.put('/listing/:id', auth, admin, listingController.updateListingAsAdmin);
router.post('/listing/review', auth, admin, listingController.reviewListing);
router.delete('/listing/:id', auth, admin, listingController.deleteListing);

module.exports = router;
