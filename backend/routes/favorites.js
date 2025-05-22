const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

router.post('/', auth, favoriteController.addFavorite);
router.delete('/:listingId', auth, favoriteController.removeFavorite);
router.get('/', auth, favoriteController.getUserFavorites);
router.get('/check/:listingId', auth, favoriteController.checkFavorite);

module.exports = router;
