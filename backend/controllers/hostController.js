const User = require('../models/User');
const Listing = require('../models/Listing');

// Apply to become a host
exports.applyToBeHost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, address, bio, identification } = req.body;

    // Check if required fields are provided
    if (!phone || !address) {
      return res.status(400).json({ message: 'Phone and address are required' });
    }

    // Update user with host info
    const user = await User.findByIdAndUpdate(
      userId, 
      {
        hostInfo: { phone, address, bio, identification },
        isHost: false, // Will be approved by admin
        hostSince: new Date()
      },
      { new: true }
    );

    // Remove sensitive info before sending response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isHost: user.isHost,
      hostInfo: user.hostInfo,
      isAdmin: user.isAdmin
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error in host application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get host profile
exports.getHostProfile = async (req, res) => {
  try {
    // If req.params.id exists, use it; otherwise use the logged-in user's ID
    const userId = req.params.id || req.user.id;
    
    const host = await User.findById(userId).select('-password');
    
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    
    if (!host.isHost && host._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'This user is not a host yet' });
    }
    
    res.json(host);
  } catch (error) {
    console.error('Error fetching host profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get host's listings
exports.getHostListings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all listings created by this host
    const listings = await Listing.find({ host: userId })
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    console.error('Error fetching host listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all host applications
exports.getPendingHostApplications = async (req, res) => {
  try {
    // Only admins can access this
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find users with hostInfo but isHost set to false
    const pendingHosts = await User.find({
      'hostInfo.phone': { $exists: true },
      isHost: false
    }).select('-password');
    
    res.json(pendingHosts);
  } catch (error) {
    console.error('Error fetching pending host applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Approve or reject host application
exports.reviewHostApplication = async (req, res) => {
  try {
    // Only admins can access this
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
      const { hostId, approve } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ message: 'Host ID is required' });
    }
    
    const user = await User.findById(hostId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isHost = approve === true;
    
    if (approve) {
      // If approved, set hostSince to current date if not already set
      if (!user.hostSince) {
        user.hostSince = new Date();
      }
    }
    
    await user.save();
    
    res.json({ 
      message: approve 
        ? 'Host application approved' 
        : 'Host application rejected',
      user: {
        id: user._id,
        name: user.name,
        isHost: user.isHost
      }
    });
  } catch (error) {
    console.error('Error reviewing host application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete host's listing
exports.deleteHostListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }
    
    // Find the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user owns this listing or is an admin
    if (listing.host.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    // Delete the listing
    await Listing.findByIdAndDelete(listingId);
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
