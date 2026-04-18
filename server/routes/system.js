const router = require('express').Router();
const SystemConfig = require('../models/SystemConfig');
const { auth, adminOnly } = require('../middleware/auth');

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
