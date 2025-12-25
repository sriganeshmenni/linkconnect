// Get submission stats for a link (faculty/admin)
exports.getSubmissionStats = async (req, res) => {
  try {
    const { linkId } = req.params;
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Get all students assigned to this link
    const assignedStudents = await require('../models/StudentLink').find({ linkId }).populate('studentId', 'name email rollNumber');
    // Get all submissions for this link
    const submissions = await require('../models/Submission').find({ link: linkId });
    const submittedStudentIds = new Set(submissions.map(s => String(s.student)));
    const stats = assignedStudents.map(sl => ({
      student: sl.studentId,
      submitted: submittedStudentIds.has(String(sl.studentId._id)),
    }));
    const submittedCount = stats.filter(s => s.submitted).length;
    const notSubmittedCount = stats.length - submittedCount;
    res.json({ success: true, stats, submittedCount, notSubmittedCount, total: stats.length });
  } catch (err) {
    console.error('Get submission stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submission stats' });
  }
};

// // Submission Controller
// const { body, validationResult } = require('express-validator');
// const Submission = require('../models/Submission');
// const Link = require('../models/Link');
// const User = require('../models/User');

// exports.createValidators = [
//   body('linkId').notEmpty().withMessage('Link ID is required'),
//   body('content').notEmpty().withMessage('Submission content is required')
// ];

// exports.create = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }
//   try {
//     // Only students can submit
//     if (req.user.role !== 'student') {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const { linkId, content } = req.body;
//     // Check if link exists and is active
//     const link = await Link.findById(linkId);
//     if (!link || !link.active) {
//       return res.status(404).json({ success: false, message: 'Link not found or inactive' });
//     }
//     // Prevent duplicate submission
//     const existing = await Submission.findOne({ link: linkId, student: req.user.id });
//     if (existing) {
//       return res.status(409).json({ success: false, message: 'Already submitted for this link' });
//     }
//     const submission = new Submission({ link: linkId, student: req.user.id, content, status: 'pending' });
//     await submission.save();
//     res.status(201).json({ success: true, submission });
//   } catch (err) {
//     console.error('Create submission error:', err);
//     res.status(500).json({ success: false, message: 'Server error creating submission' });
//   }
// };

// exports.getByStudent = async (req, res) => {
//   try {
//     const studentId = req.params.studentId || req.user.id;
//     // Only admin, faculty, or the student themselves can view
//     if (req.user.role === 'student' && req.user.id !== studentId) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const submissions = await Submission.find({ student: studentId }).populate('link');
//     res.json({ success: true, submissions });
//   } catch (err) {
//     console.error('Get submissions by student error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching submissions' });
//   }
// };

// exports.getByLink = async (req, res) => {
//   try {
//     const { linkId } = req.params;
//     // Only admin or faculty can view submissions by link
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const submissions = await Submission.find({ link: linkId }).populate('student');
//     res.json({ success: true, submissions });
//   } catch (err) {
//     console.error('Get submissions by link error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching submissions' });
//   }
// };

// exports.verifyValidators = [
//   body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
// ];

// exports.verify = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }
//   try {
//     // Only faculty and admin can verify
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const { id } = req.params;
//     const { status } = req.body;
//     const submission = await Submission.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
//     if (!submission) {
//       return res.status(404).json({ success: false, message: 'Submission not found' });
//     }
//     res.json({ success: true, submission });
//   } catch (err) {
//     console.error('Verify submission error:', err);
//     res.status(500).json({ success: false, message: 'Server error verifying submission' });
//   }
// };

// Submission Controller
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Link = require('../models/Link');
const User = require('../models/User');

exports.createValidators = [
  body('linkId').notEmpty().withMessage('Link ID is required'),
  body('screenshot').notEmpty().withMessage('Screenshot is required'),
];

exports.create = async (req, res) => {
  console.log('DEBUG: Incoming submission req.body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }


    const { linkId, studentId, screenshot } = req.body;
    // Use studentId from body if present, else fallback to req.user.id
    const student = studentId || req.user.id;

    // Debug log for received values
    console.log('[VALIDATION DEBUG] Received linkId:', linkId, 'studentId:', studentId, 'resolved student:', student);

    // Stricter validation for ObjectId
    const isValidObjectId = (id) => {
      if (!id || typeof id !== 'string') return false;
      if (id === 'null' || id === 'undefined' || id.trim() === '') return false;
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (!isValidObjectId(linkId) || !isValidObjectId(student)) {
      console.log('[VALIDATION ERROR] Invalid or missing linkId or studentId:', linkId, student);
      return res.status(400).json({ success: false, message: 'Invalid or missing linkId or studentId' });
    }

    if (!screenshot || typeof screenshot !== 'string' || screenshot.trim() === '' || screenshot === 'null' || screenshot === 'undefined') {
      console.log('[VALIDATION ERROR] Invalid screenshot:', screenshot);
      return res.status(400).json({ success: false, message: 'Screenshot is required' });
    }

    const link = await Link.findById(linkId);
    if (!link || !link.active) {
      return res.status(404).json({ success: false, message: 'Link not found / inactive' });
    }

    const existing = await Submission.findOne({ link: linkId, student });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already submitted' });
    }

    const submission = new Submission({
      link: linkId,
      student,
      screenshot,
      status: 'completed',
    });

    await submission.save();
    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error('Create submission error:', err);
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already submitted' });
    }
    res.status(500).json({ success: false, message: 'Server error creating submission' });
  }
};

exports.getByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    // Students can only see their own; faculty/admin can view any student
    if (req.user.role === 'student' && String(req.user.id) !== String(studentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const submissions = await Submission.find({ student: studentId })
      .populate('link', 'title shortUrl');

    console.log('DEBUG: Returning submissions for student', studentId, submissions);
    res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submissions by student error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

exports.getByLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const submissions = await Submission.find({ link: linkId })
      .populate('student', 'name email rollNumber')
      .populate('link', 'title shortUrl');

    res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submissions by link error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

exports.verifyValidators = [
  body('status')
    .isIn(['pending', 'completed', 'verified'])
    .withMessage('Status must be one of pending, completed, verified'),
];

exports.verify = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, submission });
  } catch (err) {
    console.error('Verify submission error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying submission' });
  }
};

