
// Analytics Controller
const User = require('../models/User');
const Link = require('../models/Link');
const Submission = require('../models/Submission');
const LoginStat = require('../models/LoginStat');

exports.getStats = async (req, res) => {
  try {
    // Only admin and faculty can view stats
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const userCount = await User.countDocuments();
    const linkCount = await Link.countDocuments();
    const submissionCount = await Submission.countDocuments();
    const approvedCount = await Submission.countDocuments({ status: 'approved' });
    const rejectedCount = await Submission.countDocuments({ status: 'rejected' });
    res.json({ success: true, stats: { userCount, linkCount, submissionCount, approvedCount, rejectedCount } });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

exports.getLogins = async (req, res) => {
  try {
    // Only admin can view login stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Aggregate login stats by day and role
    const logins = await LoginStat.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': -1 }
      }
    ]);
    res.json({ success: true, logins });
  } catch (err) {
    console.error('Get login stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching login stats' });
  }
};
