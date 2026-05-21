const router = require('express').Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

// Get all users (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent user history (admin)
router.get('/history', auth, adminOnly, async (req, res) => {
  try {
    const histories = await User.aggregate([
      { $unwind: '$history' },
      { $match: { 'history.timestamp': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }, // last 30 days
      { $sort: { 'history.timestamp': -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userObj',
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      { $unwind: { path: '$userObj', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userName: { $ifNull: ['$userObj.name', 'Unknown'] },
          action: '$history.action',
          details: '$history.details',
          timestamp: '$history.timestamp',
          userId: '$_id'
        }
      }
    ]);
    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Create user (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ name, email, password, role: role || 'user', requirePasswordChange: true });
    await user.save();
    user.history.unshift({ action: 'created', details: `New user created by ${req.user.name} with temporary password` });
    await user.save();
    
    // Send Welcome Email
    await sendWelcomeEmail(email, name, password);

    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update user (admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    // Permission check: if not admin, can only update self
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own profile.' });
    }

    const { name, email, role, active, password, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Sacred Protection: Overall Administrator cannot be modified by others
    const PROTECTED_EMAIL = 'cffachurchcoimbatore@gmail.com'.toLowerCase();
    if (user.email.toLowerCase() === PROTECTED_EMAIL && req.user.email.toLowerCase() !== PROTECTED_EMAIL) {
      return res.status(403).json({ message: 'Holy access restricted: overall administrator account can only be modified by itself.' });
    }
    
    // Security check: old password reuse prevention
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
         return res.status(400).json({ message: 'Your new password cannot be the same as your old password.' });
      }
    }

    const changes = [];
    if (name && user.name !== name) changes.push(`name to ${name}`);
    if (email && user.email !== email) changes.push(`email to ${email}`);
    if (role && user.role !== role) changes.push(`role to ${role}`);
    if (active !== undefined && user.active !== active) changes.push(active ? 'activated' : 'deactivated');
    if (password) changes.push('password changed');
    if (avatar && user.avatar !== avatar) changes.push('avatar updated');
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) user.password = password;
    if (avatar) user.avatar = avatar;
    await user.save();
    if (changes.length > 0) {
      user.history.unshift({ action: 'updated', details: `Changes: ${changes.join(', ')} by ${req.user.name}` });
      await user.save();
    }
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete user (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Sacred Protection: Overall Administrator cannot be deleted
    const PROTECTED_EMAIL = 'cffachurchcoimbatore@gmail.com'.toLowerCase();
    if (user.email.toLowerCase() === PROTECTED_EMAIL) {
      return res.status(403).json({ message: 'Sacred protection active: the overall administrator account cannot be deleted.' });
    }
    
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
    const deletedUserId = user._id;
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
