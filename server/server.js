const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/listingRoutes'));
  app.use('/api/requests', require('./routes/requestRoutes')); 
app.use('/api/reviews', require('./routes/reviewRoutes'));      
app.use('/api/admin', require('./routes/adminRoutes'));

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' });
  }
  if (err.message && err.message.includes('format')) {
    return res.status(400).json({ success: false, message: 'Invalid file format' });
  }
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Health check
app.get('/', (req, res) => res.json({ message: 'Teyzix API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));