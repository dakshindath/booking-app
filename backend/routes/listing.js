const express = require('express');
const { auth, admin } = require('../middleware/auth');
const listingController = require('../controllers/listingController');

const router = express.Router();

// Public routes
router.get('/listings', listingController.getListings);
router.get('/listing/:id', (req, res, next) => {
  // Make auth optional for this route
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (err) {
      // Ignore auth errors, just continue without user
    }
  }
  next();
}, listingController.getListingById);
router.get('/locations', listingController.getLocations);

// Host routes
router.post('/listing', auth, listingController.createListing);
router.put('/listing/:id', auth, listingController.updateListing);
router.delete('/listing/:id', auth, listingController.deleteListing);

module.exports = router;
