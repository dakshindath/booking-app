const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res)=>{
    try {
        const {listingId} = req.body;
        const userId = req.user.id;
        const existingFavorite = await Favorite.findOne({ user: userId, listing: listingId});

        if (existingFavorite){
            return res.status(400).json({message: 'Already favorited'});
        }
        const favorite = new Favorite({
            user: userId,
            listing: listingId
        });
        await favorite.save();
        res.status(201).json( {success: true, favoriteId: favorite._id});
    }
    catch(error){
        console.error('error adding favorite:', error);
        res.status(500).json({message: 'Server error'});
    }
};

 exports.removeFavorite = async (req, res)=>{
    try {
        const { listingId } = req.params;
        const userId = req.user.id;
        const result = await Favorite.findOneAndDelete({ user: userId, listing: listingId });
    
    if (!result) {
        return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ success: true, message: 'Favorite removed successfully' });
    } 
    catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
        const userId = req.user.id;   
        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'listing',
                select: '_id title location price images description avgRating reviewsCount'
            })
            .sort({ createdAt: -1 });
      
        const favoriteListings = favorites.map(favorite => favorite.listing);
        res.json(favoriteListings);
     } 
    catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkFavorite = async (req, res) => {
  try {
        const { listingId } = req.params;
        const userId = req.user.id;
        const favorite = await Favorite.findOne({ user: userId, listing: listingId });        
        res.json({ isFavorite: !!favorite });
    } 
    catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({ message: 'Server error' });
  }
};