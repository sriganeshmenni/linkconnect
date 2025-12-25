
// User Controller
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginStat = require('../models/LoginStat');

exports.getAll = async (req, res) => {
  try {
    // Only admin can get all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// Authenticated user: get their own profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// Authenticated user: update allowed profile fields
exports.updateMeValidators = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('collegeCode').optional().isString(),
  body('branchCode').optional().isString(),
  body('rollNumber').optional().isString(),
  body('year').optional().isNumeric(),
  body('section').optional().isString(),
];

exports.updateMe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const updates = { ...req.body };
    delete updates.role; // role changes not allowed here
    delete updates.password;

    // Email uniqueness check
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: req.user.id } });
      if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });
      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// Authenticated user: change password with current-password verification
exports.changePasswordValidators = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // revoke existing sessions
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};

// Authenticated user: recent logins
exports.getMyLogins = async (req, res) => {
  try {
    const logs = await LoginStat.find({ userId: req.user.id, status: 'success' })
      .sort({ loginTime: -1 })
      .limit(10)
      .lean();
    res.json({ success: true, logins: logs });
  } catch (err) {
    console.error('Get my logins error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching logins' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    // Only admin or the user themselves can get user by ID
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

exports.updateValidators = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin', 'faculty', 'student']).withMessage('Role must be valid'),
  body('rollNumber').optional().notEmpty().withMessage('Roll number required for students'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    // Only admin or the user themselves can update
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const updateData = { ...req.body };
    let user;
    if (updateData.password) {
      // Only admin can update password for others
      if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 10);
      user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Hide password in response
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};
