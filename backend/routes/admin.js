const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/admin/users', auth, admin, adminController.getAllUsers);
router.delete('/admin/user/:id', auth, admin, adminController.deleteUser);
router.put('/admin/booking/:id', auth, admin, adminController.updateBookingStatus);

module.exports = router;
