
// Submission Controller
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Link = require('../models/Link');
const User = require('../models/User');

exports.createValidators = [
  body('linkId').notEmpty().withMessage('Link ID is required'),
  body('content').notEmpty().withMessage('Submission content is required')
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // Only students can submit
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { linkId, content } = req.body;
    // Check if link exists and is active
    const link = await Link.findById(linkId);
    if (!link || !link.active) {
      return res.status(404).json({ success: false, message: 'Link not found or inactive' });
    }
    // Prevent duplicate submission
    const existing = await Submission.findOne({ link: linkId, student: req.user.id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already submitted for this link' });
    }
    const submission = new Submission({ link: linkId, student: req.user.id, content, status: 'pending' });
    await submission.save();
    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ success: false, message: 'Server error creating submission' });
  }
};

exports.getByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;
    // Only admin, faculty, or the student themselves can view
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const submissions = await Submission.find({ student: studentId }).populate('link');
    res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submissions by student error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

exports.getByLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    // Only admin or faculty can view submissions by link
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const submissions = await Submission.find({ link: linkId }).populate('student');
    res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submissions by link error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

exports.verifyValidators = [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
];

exports.verify = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // Only faculty and admin can verify
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const submission = await Submission.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, submission });
  } catch (err) {
    console.error('Verify submission error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying submission' });
  }
};
