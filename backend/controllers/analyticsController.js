
// // Analytics Controller
// const User = require('../models/User');
// const Link = require('../models/Link');
// const Submission = require('../models/Submission');
// const LoginStat = require('../models/LoginStat');

// exports.getStats = async (req, res) => {
//   try {
//     // Only admin and faculty can view stats
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const userCount = await User.countDocuments();
//     const linkCount = await Link.countDocuments();
//     const submissionCount = await Submission.countDocuments();
//     const approvedCount = await Submission.countDocuments({ status: 'approved' });
//     const rejectedCount = await Submission.countDocuments({ status: 'rejected' });
//     res.json({ success: true, stats: { userCount, linkCount, submissionCount, approvedCount, rejectedCount } });
//   } catch (err) {
//     console.error('Get stats error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching stats' });
//   }
// };

// exports.getLogins = async (req, res) => {
//   try {
//     // Only admin can view login stats
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     // Aggregate login stats by day and role
//     const logins = await LoginStat.aggregate([
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
//             role: '$role'
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $sort: { '_id.date': -1 }
//       }
//     ]);
//     res.json({ success: true, logins });
//   } catch (err) {
//     console.error('Get login stats error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching login stats' });
//   }
// };


const User = require('../models/User');
const Link = require('../models/Link');
const Submission = require('../models/Submission');
const LoginStat = require('../models/LoginStat');
const VisitStat = require('../models/VisitStat');

// Stats used by dashboards: totals and active counts
exports.getStats = async (req, res) => {
  try {
    // Only admin/faculty should access
    if (!['admin', 'faculty'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Scope stats to the logged-in faculty; admins see global totals
    // Compute date bounds for today and last 7 days (success logins)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Faculty-scoped stats
    if (req.user?.role === 'faculty') {
      const facultyLinks = await Link.find({ createdBy: req.user.id }).select('_id active');
      const linkIds = facultyLinks.map((l) => l._id);

      const [totalLinks, activeLinks, totalSubmissions, todayLogins, weekLogins] = await Promise.all([
        Promise.resolve(linkIds.length),
        Promise.resolve(facultyLinks.filter((l) => l.active).length),
        linkIds.length ? Submission.countDocuments({ link: { $in: linkIds } }) : Promise.resolve(0),
        LoginStat.countDocuments({ loginTime: { $gte: startOfToday }, role: 'faculty', status: 'success', userId: req.user.id }),
        LoginStat.countDocuments({ loginTime: { $gte: sevenDaysAgo }, role: 'faculty', status: 'success', userId: req.user.id }),
      ]);

      return res.json({
        success: true,
        stats: {
          totalLinks,
          activeLinks,
          totalSubmissions,
          todayLogins,
          weekLogins,
        },
      });
    }

    // Admin/global view
    const [totalUsers, totalLinks, activeLinks, totalSubmissions, todayLogins, weekLogins] = await Promise.all([
      User.countDocuments(),
      Link.countDocuments(),
      Link.countDocuments({ active: true }),
      Submission.countDocuments(),
      LoginStat.countDocuments({ loginTime: { $gte: startOfToday }, status: 'success' }),
      LoginStat.countDocuments({ loginTime: { $gte: sevenDaysAgo }, status: 'success' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalLinks,
        activeLinks,
        totalSubmissions,
        todayLogins,
        weekLogins,
      },
    });
  } catch (error) {
    console.error('Analytics getStats error:', error);
    res.status(500).json({ success: false, message: 'Analytics Error' });
  }
};

// Login statistics grouped by day and role (last 14 days)
exports.getLogins = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6); // last 7 days including today
    since.setHours(0, 0, 0, 0);

    const logins = await LoginStat.aggregate([
      { $match: { loginTime: { $gte: since }, status: 'success' } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$loginTime' } } },
          logins: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const formatted = logins.map((item) => ({ date: item._id.date, logins: item.logins }));
    res.json({ success: true, logins: formatted });
  } catch (err) {
    console.error('Get login stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching login stats' });
  }
};

// Track visits (login/registration/landing) without auth; role is optional
exports.trackVisit = async (req, res) => {
  try {
    const role = (req.body?.role || 'guest').toLowerCase();
    const roleKey = ['admin', 'faculty', 'student', 'guest'].includes(role) ? role : 'unknown';

    await VisitStat.findOneAndUpdate(
      { key: 'global' },
      {
        $inc: {
          total: 1,
          [`byRole.${roleKey}`]: 1,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ success: false, message: 'Failed to record visit' });
  }
};

// Admin-only: get aggregated visit counts
exports.getVisits = async (req, res) => {
  try {
    const stats = await VisitStat.findOne({ key: 'global' }).lean();
    const payload = stats || { total: 0, byRole: { admin: 0, faculty: 0, student: 0, guest: 0, unknown: 0 } };
    res.json({ success: true, visits: payload });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visits' });
  }
};

