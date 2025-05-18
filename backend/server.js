require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listing');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');

app.use('/api', authRoutes);
app.use('/api', listingRoutes);
app.use('/api', bookingRoutes);
app.use('/api', adminRoutes);


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/booking-app')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
