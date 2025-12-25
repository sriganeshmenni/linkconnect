
// // Export Controller
// const ExcelJS = require('exceljs');
// const User = require('../models/User');
// const Link = require('../models/Link');
// const Submission = require('../models/Submission');
// const LoginStat = require('../models/LoginStat');

// async function sendExcel(res, workbook, filename) {
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//   await workbook.xlsx.write(res);
//   res.end();
// }

// exports.exportUsers = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const users = await User.find().select('-password');
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Users');
//     sheet.columns = [
//       { header: 'ID', key: '_id' },
//       { header: 'Name', key: 'name' },
//       { header: 'Email', key: 'email' },
//       { header: 'Role', key: 'role' },
//       { header: 'Roll Number', key: 'rollNumber' }
//     ];
//     users.forEach(user => sheet.addRow(user.toObject()));
//     await sendExcel(res, workbook, 'users.xlsx');
//   } catch (err) {
//     console.error('Export users error:', err);
//     res.status(500).json({ success: false, message: 'Server error exporting users' });
//   }
// };

// exports.exportLinks = async (req, res) => {
//   try {
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const links = await Link.find();
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Links');
//     sheet.columns = [
//       { header: 'ID', key: '_id' },
//       { header: 'Title', key: 'title' },
//       { header: 'URL', key: 'url' },
//       { header: 'Description', key: 'description' },
//       { header: 'Active', key: 'active' },
//       { header: 'Created By', key: 'createdBy' }
//     ];
//     links.forEach(link => sheet.addRow(link.toObject()));
//     await sendExcel(res, workbook, 'links.xlsx');
//   } catch (err) {
//     console.error('Export links error:', err);
//     res.status(500).json({ success: false, message: 'Server error exporting links' });
//   }
// };

// exports.exportSubmissions = async (req, res) => {
//   try {
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const submissions = await Submission.find().populate('student link');
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Submissions');
//     sheet.columns = [
//       { header: 'ID', key: '_id' },
//       { header: 'Student', key: 'student' },
//       { header: 'Link', key: 'link' },
//       { header: 'Content', key: 'content' },
//       { header: 'Status', key: 'status' },
//       { header: 'Created At', key: 'createdAt' }
//     ];
//     submissions.forEach(sub => {
//       sheet.addRow({
//         _id: sub._id,
//         student: sub.student ? sub.student.name : '',
//         link: sub.link ? sub.link.title : '',
//         content: sub.content,
//         status: sub.status,
//         createdAt: sub.createdAt
//       });
//     });
//     await sendExcel(res, workbook, 'submissions.xlsx');
//   } catch (err) {
//     console.error('Export submissions error:', err);
//     res.status(500).json({ success: false, message: 'Server error exporting submissions' });
//   }
// };

// exports.exportLogins = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const logins = await LoginStat.find().populate('user');
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Logins');
//     sheet.columns = [
//       { header: 'ID', key: '_id' },
//       { header: 'User', key: 'user' },
//       { header: 'Role', key: 'role' },
//       { header: 'Timestamp', key: 'timestamp' }
//     ];
//     logins.forEach(login => {
//       sheet.addRow({
//         _id: login._id,
//         user: login.user ? login.user.name : '',
//         role: login.role,
//         timestamp: login.timestamp
//       });
//     });
//     await sendExcel(res, workbook, 'logins.xlsx');
//   } catch (err) {
//     console.error('Export logins error:', err);
//     res.status(500).json({ success: false, message: 'Server error exporting logins' });
//   }
// };

// Export Controller
const ExcelJS = require('exceljs');
const User = require('../models/User');
const Link = require('../models/Link');
const Submission = require('../models/Submission');
const LoginStat = require('../models/LoginStat');

async function sendExcel(res, workbook, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

exports.exportUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const users = await User.find().select('-password');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');

    sheet.columns = [
      { header: 'ID', key: '_id' },
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Role', key: 'role' },
      { header: 'Roll Number', key: 'rollNumber' },
    ];

    users.forEach((user) => sheet.addRow(user.toObject()));

    await sendExcel(res, workbook, 'users.xlsx');
  } catch (err) {
    console.error('Export users error:', err);
    res.status(500).json({ success: false, message: 'Server error exporting users' });
  }
};

exports.exportLinks = async (req, res) => {
  try {
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const links = await Link.find().populate('createdBy', 'name email');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Links');

    sheet.columns = [
      { header: 'ID', key: '_id' },
      { header: 'Title', key: 'title' },
      { header: 'URL', key: 'url' },
      { header: 'Description', key: 'description' },
      { header: 'Active', key: 'active' },
      { header: 'Created By', key: 'createdBy' },
    ];

    links.forEach((link) => {
      sheet.addRow({
        _id: link._id,
        title: link.title,
        url: link.url,
        description: link.description,
        active: link.active,
        createdBy: link.createdBy ? link.createdBy.name : 'N/A',
      });
    });

    await sendExcel(res, workbook, 'links.xlsx');
  } catch (err) {
    console.error('Export links error:', err);
    res.status(500).json({ success: false, message: 'Server error exporting links' });
  }
};

exports.exportSubmissions = async (req, res) => {
  try {
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const submissions = await Submission.find()
      .populate('student', 'name email rollNumber')
      .populate('link', 'title shortUrl');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Submissions');

    sheet.columns = [
      { header: 'ID', key: '_id' },
      { header: 'Student', key: 'student' },
      { header: 'Roll Number', key: 'rollNumber' },
      { header: 'Link', key: 'link' },
      { header: 'Content', key: 'content' },
      { header: 'Status', key: 'status' },
      { header: 'Created At', key: 'createdAt' },
    ];

    submissions.forEach((sub) => {
      sheet.addRow({
        _id: sub._id,
        student: sub.student ? sub.student.name : '',
        rollNumber: sub.student ? sub.student.rollNumber : '',
        link: sub.link ? sub.link.title : '',
        content: sub.content,
        status: sub.status,
        createdAt: sub.createdAt,
      });
    });

    await sendExcel(res, workbook, 'submissions.xlsx');
  } catch (err) {
    console.error('Export submissions error:', err);
    res.status(500).json({ success: false, message: 'Server error exporting submissions' });
  }
};

exports.exportLogins = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const logins = await LoginStat.find().populate('user', 'name email role');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Logins');

    sheet.columns = [
      { header: 'ID', key: '_id' },
      { header: 'User', key: 'user' },
      { header: 'Role', key: 'role' },
      { header: 'Timestamp', key: 'timestamp' },
    ];

    logins.forEach((login) => {
      sheet.addRow({
        _id: login._id,
        user: login.user ? login.user.name : '',
        role: login.user ? login.user.role : '',
        timestamp: login.timestamp,
      });
    });

    await sendExcel(res, workbook, 'logins.xlsx');
  } catch (err) {
    console.error('Export logins error:', err);
    res.status(500).json({ success: false, message: 'Server error exporting logins' });
  }
};
 