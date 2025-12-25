
// Auth Controller
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginStat = require('../models/LoginStat');

exports.registerValidators = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isStrongPassword().withMessage('Password must be strong'),
  body('role').isIn(['admin', 'faculty', 'student']).withMessage('Role must be valid'),
  body('rollNumber').if(body('role').equals('student')).notEmpty().withMessage('Roll number required for students')
];

exports.register = async (req, res) => {
  if (process.env.ALLOW_SELF_REGISTER !== 'true') {
    return res.status(403).json({ success: false, message: 'Self-registration is disabled. Please contact an admin.' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, email, password, role, rollNumber } = req.body;
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create user object
    const userData = { name, email, password: hashedPassword, role };
    if (role === 'student') userData.rollNumber = rollNumber;
    const user = new User(userData);
    await user.save();
    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.loginValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  body('role').isIn(['admin', 'faculty', 'student']).withMessage('Role must be valid')
];

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Generate JWT (include tokenVersion for force logout)
    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Record login stat (normalized fields)
    await LoginStat.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'success',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      loginTime: new Date(),
    });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.me = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};
