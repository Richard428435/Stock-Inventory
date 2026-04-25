const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or allowed origins or any vercel.app
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ limit: '600mb', extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/system', require('./routes/system'));
app.use('/api/users', require('./routes/users'));
app.use('/api/inventory/items', require('./routes/inventory/items'));
app.use('/api/inventory/categories', require('./routes/inventory/categories'));
app.use('/api/inventory/stock-logs', require('./routes/inventory/stockLogs'));
app.use('/api/inventory/maintenance', require('./routes/inventory/maintenance'));
// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    message: 'Sacred Steward API running' 
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Auto-seed Overall Administrator
    try {
      const User = require('./models/User');
      const adminEmail = 'cffachurchcoimbatore@gmail.com'.toLowerCase();
      const existing = await User.findOne({ email: adminEmail });
      if (!existing) {
        await User.create({ 
          name: 'CFFA Admin', 
          email: adminEmail, 
          password: 'Jai171065', 
          role: 'admin',
          active: true 
        });
        console.log('✅ CFFA Admin account created');
      } else {
        existing.name = 'CFFA Admin';
        existing.password = 'Jai171065';
        existing.role = 'admin';
        existing.active = true;
        await existing.save();
        console.log('ℹ️  CFFA Admin credentials synchronized');
      }
    } catch (seedErr) {
      console.error('Auto-seed failed:', seedErr.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Start server locally (Skip if on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
