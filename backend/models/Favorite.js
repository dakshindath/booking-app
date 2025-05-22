const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },listing:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

}, {timestamps: true});

favoriteSchema.index({ user:1, listing:1}, { unique: true});

module.exports = mongoose.model('Favorite', favoriteSchema);