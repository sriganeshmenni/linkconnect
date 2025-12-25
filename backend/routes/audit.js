const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const AdminAuditLog = require('../models/AdminAuditLog');

router.use(auth, roleCheck('admin'));

// GET /api/audit?skip=0&limit=50&action=&actor=&targetUser=&targetLink=&from=&to=
router.get('/', async (req, res) => {
  const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  const { action, actor, targetUser, targetLink, from, to } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (actor) filter.actor = actor;
  if (targetUser) filter.targetUser = targetUser;
  if (targetLink) filter.targetLink = targetLink;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  try {
    const [rows, total] = await Promise.all([
      AdminAuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email')
        .populate('targetUser', 'name email role')
        .populate('targetLink', 'title createdByEmail')
        .lean(),
      AdminAuditLog.countDocuments(filter),
    ]);

    res.json({ success: true, total, rows });
  } catch (err) {
    console.error('Audit fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/audit/export (simple CSV)
router.get('/export', async (_req, res) => {
  try {
    const rows = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5000)
      .populate('actor', 'name email')
      .populate('targetUser', 'name email role')
      .populate('targetLink', 'title createdByEmail')
      .lean();

    const header = ['Timestamp', 'Actor', 'Action', 'TargetUser', 'TargetLink', 'Meta'];
    const csv = [header]
      .map((row) => row.join(','))
      .concat(
        rows.map((r) => [
          new Date(r.createdAt).toISOString(),
          `${r.actor?.name || ''} <${r.actor?.email || ''}>`,
          r.action,
          r.targetUser ? `${r.targetUser.name || ''} <${r.targetUser.email || ''}> (${r.targetUser.role || ''})` : '',
          r.targetLink ? `${r.targetLink.title || ''} (${r.targetLink.createdByEmail || ''})` : '',
          JSON.stringify(r.meta || {}),
        ].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Audit export error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
