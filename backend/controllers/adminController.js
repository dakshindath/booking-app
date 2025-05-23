const User = require('../models/User');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for dashboard
    const totalUsers = await User.countDocuments();
    const totalHosts = await User.countDocuments({ isHost: true });
    const pendingHostApplications = await User.countDocuments({ 
      'hostInfo.phone': { $exists: true }, 
      isHost: false 
    });
    
    const totalListings = await Listing.countDocuments();
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const approvedListings = await Listing.countDocuments({ status: 'approved' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    
    // Calculate revenue
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    res.json({
      users: {
        total: totalUsers,
        hosts: totalHosts,
        pendingHostApplications
      },
      listings: {
        total: totalListings,
        pending: pendingListings,
        approved: approvedListings
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings
      },
      revenue: {
        total: totalRevenue
      }
    });
  } catch (err) {
    console.error('Error getting admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error getting all users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = req.body.status;
    await booking.save();
    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveHostApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.hostInfo.phone || !user.hostInfo.address) {
      return res.status(400).json({ message: 'User has not completed host application' });
    }

    user.isHost = true;
    user.hostSince = new Date();
    user.hostInfo.status = 'approved';
    await user.save();

    res.json({ message: 'Host application approved', user });
  } catch (err) {
    console.error('Error approving host application:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({ isHost: true }).select('-password');
    res.json(hosts);
  } catch (err) {
    console.error('Error getting all hosts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.revokeHostStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isHost) {
      return res.status(400).json({ message: 'User is not a host' });
    }

    // Prevent revoking host status from admin users
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot revoke host status from admin users' });
    }

    user.isHost = false;
    
    // Set status to rejected when revoking
    if (user.hostInfo) {
      user.hostInfo.status = 'rejected';
    }
    
    await user.save();

    res.json({ message: 'Host status revoked successfully', user });
  } catch (err) {
    console.error('Error revoking host status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};