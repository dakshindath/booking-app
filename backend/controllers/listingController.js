const Listing = require('../models/Listing');

exports.getListings = async (req, res) => {
  try {
    let filters = {};
    
    // Handle location search with case-insensitive regex pattern
    if (req.query.location) {
      filters.location = { $regex: new RegExp(req.query.location, 'i') };
    }
    
    // Add any other filters from query params
    Object.keys(req.query).forEach(key => {
      if (key !== 'location') {
        filters[key] = req.query[key];
      }
    });
    
    const listings = await Listing.find(filters);
    res.json(listings);
  } catch (err) {
    console.error('Error in getListings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const listing = new Listing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLocations = async (req, res) => {
  try {
    // Use MongoDB aggregation to get unique locations
    const locations = await Listing.aggregate([
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
