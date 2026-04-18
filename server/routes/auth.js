const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const isAdmin = role === 'admin';
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      active: !isAdmin // Admins need approval
    });

    // Log history
    user.history.unshift({
      action: 'registered',
      details: `Self-registered as ${role || 'user'}. ${isAdmin ? 'Pending approval.' : 'Auto-activated.'}`
    });

    await user.save();

    if (user.active) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // Pending Admin
    res.status(201).json({
      message: 'Registration successful. administrator account pending approval.',
      pending: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.active) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Temporary Password Interception
    if (user.requirePasswordChange) {
      return res.status(200).json({ 
        requiresPasswordChange: true, 
        email: user.email, 
        message: 'Security Policy: Please update your temporary password to continue.' 
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Force Password Change (No Auth Middleware Required, but needs old password)
router.post('/force-change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.active) return res.status(400).json({ message: 'Invalid request' });

    // Verify old temporary password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    // Validate new password is different
    const isSame = await user.comparePassword(newPassword);
    if (isSame) return res.status(400).json({ message: 'Your new password cannot be the same as your temporary password.' });

    // Accept change
    user.password = newPassword;
    user.requirePasswordChange = false;
    user.history.unshift({ action: 'security', details: 'Completed mandatory temporary password change.' });
    await user.save();

    // Log the user in normally 
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
