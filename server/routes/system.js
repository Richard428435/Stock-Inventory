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

// Upload media (Google Drive primary, Base64 fallback)
router.post('/upload', auth, adminOnly, async (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ message: 'Missing file data' });
    }

    // Attempt Google Drive Upload if configured
    if (process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      try {
        const { uploadToDrive } = require('../utils/googleDrive');
        const driveUrl = await uploadToDrive(base64, filename);
        return res.json({ url: driveUrl });
      } catch (driveErr) {
        console.error('Drive Upload failed, falling back to Base64:', driveErr);
      }
    }

    // Default Fallback: Return raw base64 (saved to DB by frontend)
    res.json({ url: base64 });
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
