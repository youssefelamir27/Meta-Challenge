const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        console.error('Please check your MONGODB_URL in .env file');
    });

module.exports = mongoose;