
// User Controller
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

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
  body('rollNumber').optional().notEmpty().withMessage('Roll number required for students')
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
    // Prevent password update here
    delete updateData.password;
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
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
