const express = require('express');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/user/:id', auth, authController.getUser);
router.put('/user/:id', auth, authController.updateUser);

module.exports = router;
