const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Link = require('../models/Link');
const LoginStat = require('../models/LoginStat');
const Submission = require('../models/Submission');
const { updateConfig: updateRateLimitConfig, getConfig: getRateLimitConfig } = require('../utils/rateLimiter');
const AdminAuditLog = require('../models/AdminAuditLog');
const DivisionCatalog = require('../models/DivisionCatalog');

const userCreateValidators = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['admin', 'faculty', 'student']).withMessage('Role must be valid'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('rollNumber').optional().isString(),
];

// Toggle user active/inactive
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.active = !user.active;
    await user.save();

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'user_toggle',
      targetUser: user._id,
      meta: { active: user.active },
    });

    return res.json({ success: true, user: { id: user._id, active: user.active } });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset user password (admin sets new password)
exports.resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Assign raw password and allow the User model pre-save hook to hash it
    user.password = newPassword;
    // Bump tokenVersion to force logout old sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'user_reset_password',
      targetUser: user._id,
    });

    return res.json({ success: true, message: 'Password reset and sessions revoked' });
  } catch (err) {
    console.error('resetUserPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Force logout: bump tokenVersion so existing JWTs become invalid
exports.forceLogoutUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'user_force_logout',
      targetUser: user._id,
    });

    return res.json({ success: true, message: 'User sessions revoked' });
  } catch (err) {
    console.error('forceLogoutUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get recent activity (login history) for a user
exports.getUserActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await LoginStat.find({ userId: id, status: 'success' })
      .sort({ loginTime: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, activity: logs });
  } catch (err) {
    console.error('getUserActivity error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search users and return per-user activity summary (logins count, last login, links/submissions)
exports.searchUserActivity = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
  }
  try {
    const regex = new RegExp(query.trim(), 'i');
    const users = await User.find({ $or: [{ name: regex }, { email: regex }, { rollNumber: regex }] })
      .select('name email role rollNumber createdAt')
      .limit(10)
      .lean();

    const userIds = users.map((u) => u._id);

    const [loginAgg, linkAgg, submissionAgg] = await Promise.all([
      LoginStat.aggregate([
        { $match: { userId: { $in: userIds }, status: 'success' } },
        {
          $group: {
            _id: '$userId',
            totalLogins: { $sum: 1 },
            lastLogin: { $max: '$loginTime' },
          },
        },
      ]),
      Link.aggregate([
        { $match: { createdBy: { $in: userIds } } },
        { $group: { _id: '$createdBy', linksCreated: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $match: { student: { $in: userIds } } },
        { $group: { _id: '$student', submissions: { $sum: 1 } } },
      ]),
    ]);

    const loginMap = new Map(loginAgg.map((l) => [String(l._id), l]));
    const linkMap = new Map(linkAgg.map((l) => [String(l._id), l.linksCreated]));
    const subMap = new Map(submissionAgg.map((s) => [String(s._id), s.submissions]));

    const result = users.map((u) => {
      const idStr = String(u._id);
      const login = loginMap.get(idStr);
      return {
        ...u,
        totalLogins: login?.totalLogins || 0,
        lastLogin: login?.lastLogin || null,
        linksCreated: linkMap.get(idStr) || 0,
        submissions: subMap.get(idStr) || 0,
      };
    });

    res.json({ success: true, users: result });
  } catch (err) {
    console.error('searchUserActivity error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle link active/inactive
exports.toggleLinkActive = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    link.active = !link.active;
    await link.save();

    res.json({ success: true, link: { id: link._id, active: link.active } });
    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'link_toggle',
      targetLink: link._id,
      meta: { active: link.active },
    });
  } catch (err) {
    console.error('toggleLinkActive error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current rate limit configuration
exports.getRateLimit = async (_req, res) => {
  try {
    const cfg = getRateLimitConfig();
    res.json({ success: true, config: cfg });
  } catch (err) {
    console.error('getRateLimit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update rate limit configuration (in-memory, immediate)
exports.updateRateLimit = async (req, res) => {
  try {
    const { windowMs, max } = req.body || {};

    // Basic guards
    if ((windowMs && windowMs < 1000) || (max && max < 1)) {
      return res.status(400).json({ success: false, message: 'Invalid rate limit values' });
    }

    const cfg = updateRateLimitConfig({
      windowMs: typeof windowMs === 'number' ? windowMs : undefined,
      max: typeof max === 'number' ? max : undefined,
      updatedBy: req.user.id,
    });

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'rate_limit_update',
      meta: { windowMs: cfg.windowMs, max: cfg.max },
    });

    res.json({ success: true, config: cfg });
  } catch (err) {
    console.error('updateRateLimit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createUserValidators = userCreateValidators;

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, email, role, password, rollNumber, collegeCode, branchCode, year, section } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Always pass raw password to User.create so the model pre-save hook hashes it
    const rawPassword = password || process.env.DEFAULT_USER_PASSWORD || 'Welcome@123';
    const user = await User.create({
      name,
      email,
      role,
      password: rawPassword,
      rollNumber: role === 'student' ? rollNumber : undefined,
      collegeCode: collegeCode || undefined,
      branchCode: branchCode || undefined,
      year: year || undefined,
      section: section || undefined,
    });

    await AdminAuditLog.create({ actor: req.user.id, action: 'user_create', targetUser: user._id });

    res.status(201).json({ success: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ success: false, message: 'Server error creating user' });
  }
};

exports.bulkCreateUsers = async (req, res) => {
  try {
    const { users = [], sharedPassword } = req.body || {};
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Users array required' });
    }

    const pwd = sharedPassword || process.env.DEFAULT_USER_PASSWORD || 'Welcome@123';
    const hashed = await bcrypt.hash(pwd, 10);

    const docs = users
      .filter((u) => u && u.email && u.name && ['admin', 'faculty', 'student'].includes(u.role))
      .map((u) => ({
        name: u.name,
        email: String(u.email).toLowerCase(),
        role: u.role,
        password: u.password ? u.password : hashed,
        rollNumber: u.role === 'student' ? u.rollNumber : undefined,
        collegeCode: u.collegeCode || undefined,
        branchCode: u.branchCode || undefined,
        year: u.year || undefined,
        section: u.section || undefined,
      }));

    if (!docs.length) {
      return res.status(400).json({ success: false, message: 'No valid users to insert' });
    }

    // Pre-hash per-user passwords if provided raw
    for (const doc of docs) {
      if (doc.password && doc.password !== hashed) {
        doc.password = await bcrypt.hash(doc.password, 10);
      }
    }

    // Skip users that already exist by email or rollNumber
    const emailSet = new Set(docs.map((d) => d.email));
    const rollVals = docs.map((d) => d.rollNumber).filter(Boolean);
    const existing = await User.find({
      $or: [{ email: { $in: Array.from(emailSet) } }, ...(rollVals.length ? [{ rollNumber: { $in: rollVals } }] : [])],
    })
      .select('email rollNumber')
      .lean();

    const existingEmails = new Set(existing.map((e) => e.email.toLowerCase()));
    const existingRolls = new Set(existing.map((e) => e.rollNumber).filter(Boolean));

    const filteredDocs = docs.filter(
      (d) => !existingEmails.has(d.email) && (!d.rollNumber || !existingRolls.has(d.rollNumber))
    );

    if (!filteredDocs.length) {
      return res.json({ success: true, inserted: 0, requested: docs.length, skippedExisting: docs.length });
    }

    let inserted = 0;
    try {
      const result = await User.insertMany(filteredDocs, { ordered: false });
      inserted = result.length;
    } catch (err) {
      if (err.insertedDocs) inserted = err.insertedDocs.length;
      else console.warn('bulkCreateUsers warning:', err.message);
    }

    const skippedExisting = docs.length - filteredDocs.length;

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'user_bulk_create',
      meta: { requested: docs.length, inserted, skippedExisting },
    });

    res.json({ success: true, inserted, requested: docs.length, skippedExisting });
  } catch (err) {
    console.error('bulkCreateUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error creating users' });
  }
};

exports.getDivisionCatalog = async (_req, res) => {
  try {
    const catalog = await DivisionCatalog.findOne();
    res.json({ success: true, catalog });
  } catch (err) {
    console.error('getDivisionCatalog admin error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching catalog' });
  }
};

exports.saveDivisionCatalog = async (req, res) => {
  try {
    const { colleges = [] } = req.body || {};
    const filtered = Array.isArray(colleges) ? colleges : [];

    const catalog = await DivisionCatalog.findOneAndUpdate(
      {},
      { colleges: filtered, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'division_catalog_update',
      meta: { colleges: filtered.length },
    });

    res.json({ success: true, catalog });
  } catch (err) {
    console.error('saveDivisionCatalog error:', err);
    res.status(500).json({ success: false, message: 'Server error saving catalog' });
  }
};
