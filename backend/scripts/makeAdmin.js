const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/booking-app')
  .then(async () => {
    const User = require('../models/User');
    try {
      const result = await User.updateOne(
        { email: 'testhost@example.com' },
        { $set: { isAdmin: true } }
      );
      console.log('Update result:', result);
    } catch (err) {
      console.error('Error:', err);
    }
    process.exit();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
