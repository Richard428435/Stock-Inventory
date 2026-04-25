const router = require('express').Router();
const SystemConfig = require('../models/SystemConfig');
const { auth, adminOnly } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Get config (public so the login screen can load logos and backgrounds)
router.get('/', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload media to disk (bypasses MongoDB limit)
router.post('/upload', auth, adminOnly, async (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ message: 'Missing file data' });
    }

    // Extract base64 data
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid base64 format' });
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = path.extname(filename) || (type.includes('video') ? '.mp4' : '.jpg');
    const uniqueName = `upload_${Date.now()}${ext}`;
    
    // Ensure directory exists
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);
    
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update config (admin only)
router.put('/', auth, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;
    // ensure singleton field isn't modified
    delete updateData.isSingleton; 
    
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }
    
    Object.assign(config, updateData);
    await config.save();
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
