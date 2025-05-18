const Listing = require('../models/Listing');

exports.getListings = async (req, res) => {
  try {
    const filters = req.query;
    const listings = await Listing.find(filters);
    res.json(listings);
  } catch (err) {
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
