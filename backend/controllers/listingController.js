const Listing = require('../models/Listing');
const User = require('../models/User');

exports.getListings = async (req, res) => {
  try {
    let filters = { status: 'approved' }; // Default to showing only approved listings
    
    // Handle location search with case-insensitive regex pattern
    if (req.query.location) {
      filters.location = { $regex: new RegExp(req.query.location, 'i') };
    }
    
    // Add any other filters from query params
    Object.keys(req.query).forEach(key => {
      if (key !== 'location' && key !== 'includeAllStatuses') {
        filters[key] = req.query[key];
      }
    });
    
    // Admin can see all listings if requested
    if (req.user && req.user.isAdmin && req.query.includeAllStatuses === 'true') {
      delete filters.status;
    }
    
    const listings = await Listing.find(filters).populate('host', 'name avatar');
    res.json(listings);
  } catch (err) {
    console.error('Error in getListings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name avatar hostSince');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // If listing is approved, anyone can view it
    if (listing.status === 'approved') {
      return res.json(listing);
    }
    
    // If listing is not approved, only the host or admin can view it
    if (req.user) {
      // Check if listing.host exists and handle it properly
      // It might be a populated object or just an ObjectId
      let hostId;
      if (listing.host) {
        hostId = typeof listing.host === 'object' && listing.host._id 
          ? listing.host._id.toString() 
          : listing.host.toString();
      }
      
      if (hostId && (req.user.id === hostId || req.user.isAdmin)) {
        return res.json(listing);
      }
    }
    
    // If user is not authenticated or not authorized to view this listing
    return res.status(404).json({ message: 'Listing not found' });
  } catch (err) {
    console.error('Error in getListingById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createListing = async (req, res) => {
  try {
    // Check if user is a host
    const user = await User.findById(req.user.id);
    if (!user.isHost) {
      return res.status(403).json({ message: 'Only hosts can create listings' });
    }
    
    // Create new listing with the host ID and default pending status
    const listingData = {
      ...req.body,
      host: req.user.id,
      status: 'pending',
      isApproved: false
    };
    
    const listing = new Listing(listingData);
    await listing.save();
    
    res.status(201).json(listing);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is authorized to update (host or admin)
    if (req.user.id !== listing.host.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    // If the host makes significant changes, reset to pending
    if (req.user.id === listing.host.toString() && !req.user.isAdmin) {
      const significantFields = ['title', 'description', 'price', 'location'];
      const hasSignificantChanges = significantFields.some(field => 
        req.body[field] !== undefined && req.body[field] !== listing[field]
      );
      
      if (hasSignificantChanges && listing.status === 'approved') {
        req.body.status = 'pending';
        req.body.isApproved = false;
      }
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    res.json(updatedListing);
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is authorized to delete (host or admin)
    if (req.user.id !== listing.host.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    await Listing.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLocations = async (req, res) => {
  try {
    // Use MongoDB aggregation to get unique locations
    const locations = await Listing.aggregate([
      { $match: { status: 'approved' } }, // Only include approved listings
      { $group: { _id: '$location' } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, location: '$_id' } }
    ]);
    
    res.json(locations.map(item => item.location));
  } catch (err) {
    console.error('Error getting locations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get pending listings for approval
exports.getPendingListings = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const pendingListings = await Listing.find({ status: 'pending' })
      .populate('host', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(pendingListings);
  } catch (err) {
    console.error('Error getting pending listings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Approve or reject a listing
exports.reviewListing = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { listingId, approve, rejectionReason } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }
    
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Update the listing status
    listing.status = approve ? 'approved' : 'rejected';
    listing.isApproved = approve;
    
    if (!approve && rejectionReason) {
      listing.rejectionReason = rejectionReason;
    }
    
    await listing.save();
    
    res.json({
      message: approve ? 'Listing approved' : 'Listing rejected',
      listing: {
        id: listing._id,
        title: listing.title,
        status: listing.status
      }
    });
  } catch (err) {
    console.error('Error reviewing listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin-specific listing methods
exports.createListingAsAdmin = async (req, res) => {
  try {
    // Admin can create listings with approved status by default
    const listingData = {
      ...req.body,
      host: req.user.id, // Admin becomes the host
      status: 'approved',
      isApproved: true
    };
    
    const listing = new Listing(listingData);
    await listing.save();
    
    res.status(201).json(listing);
  } catch (err) {
    console.error('Error creating listing as admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateListingAsAdmin = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (err) {
    console.error('Error updating listing as admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
