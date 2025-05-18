const express = require('express');
const { auth, admin } = require('../middleware/auth');
const listingController = require('../controllers/listingController');

const router = express.Router();

router.get('/listings', listingController.getListings);
router.get('/listing/:id', listingController.getListingById);

router.post('/admin/listing', auth, admin, listingController.createListing);
router.put('/admin/listing/:id', auth, admin, listingController.updateListing);
router.delete('/admin/listing/:id', auth, admin, listingController.deleteListing);

module.exports = router;
