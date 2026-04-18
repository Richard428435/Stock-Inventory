const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/system', require('./routes/system'));
app.use('/api/users', require('./routes/users'));
app.use('/api/inventory/items', require('./routes/inventory/items'));
app.use('/api/inventory/categories', require('./routes/inventory/categories'));
app.use('/api/inventory/stock-logs', require('./routes/inventory/stockLogs'));
app.use('/api/inventory/maintenance', require('./routes/inventory/maintenance'));
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Sacred Steward API running' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
