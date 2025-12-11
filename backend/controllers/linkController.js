
// Link Controller
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');
const User = require('../models/User');
const StudentLink = require('../models/StudentLink');

exports.getAll = async (req, res) => {
  try {
    // All authenticated users can view links
    const links = await Link.find().sort({ createdAt: -1 });
    res.json({ success: true, links });
  } catch (err) {
    console.error('Get all links error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching links' });
  }
};

// Get links for a specific student
exports.getStudentLinks = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get all StudentLink records for this student with populated link data
    const studentLinks = await StudentLink.find({ studentId })
      .populate('linkId')
      .sort({ assignedAt: -1 });
    
    // Extract just the links and mark as viewed
    const links = studentLinks.map(sl => sl.linkId);
    
    res.json({ success: true, links });
  } catch (err) {
    console.error('Get student links error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching links' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, link });
  } catch (err) {
    console.error('Get link by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching link' });
  }
};

exports.createValidators = [
  body('title').notEmpty().withMessage('Title is required'),
  body('url').isURL().withMessage('Valid URL required'),
  body('shortUrl').notEmpty().withMessage('Short URL is required'),
  body('deadline').notEmpty().isISO8601().withMessage('Valid deadline is required'),
  body('description').optional().isString(),
  body('active').optional().isBoolean()
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // Only faculty and admin can create links
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { title, url, shortUrl, deadline, description, active } = req.body;
    const link = new Link({
      title,
      url,
      shortUrl,
      deadline,
      description,
      active: active ?? true,
      createdBy: req.user.id,
      createdByEmail: req.user.email,
      registrations: 0
    });
    await link.save();

    // Push this link to all students in the database
    try {
      const allStudents = await User.find({ role: 'student' });
      
      if (allStudents.length > 0) {
        const studentLinkRecords = allStudents.map(student => ({
          linkId: link._id,
          studentId: student._id,
          studentEmail: student.email,
          assignedAt: new Date()
        }));
        
        // Bulk insert with ignoring duplicates (shouldn't happen on creation, but safe)
        await StudentLink.insertMany(studentLinkRecords, { ordered: false }).catch(err => {
          // Ignore duplicate key errors, log others
          if (err.code !== 11000) {
            console.warn('Warning during student link assignment:', err.message);
          }
        });
        
        console.log(`✓ Link "${title}" pushed to ${allStudents.length} students`);
      }
    } catch (pushError) {
      console.warn('Error pushing link to students:', pushError);
      // Don't fail the link creation if push fails, but log it
    }

    res.status(201).json({ success: true, link });
  } catch (err) {
    console.error('Create link error:', err);
    res.status(500).json({ success: false, message: 'Server error creating link' });
  }
};

exports.updateValidators = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('url').optional().isURL().withMessage('Valid URL required'),
  body('description').optional().isString(),
  body('active').optional().isBoolean()
];

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    // Only faculty and admin can update links
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const updateData = { ...req.body };
    const link = await Link.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, link });
  } catch (err) {
    console.error('Update link error:', err);
    res.status(500).json({ success: false, message: 'Server error updating link' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    // Faculty and admin can delete links
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    // Faculty can only delete their own links, admin can delete any
    if (req.user.role === 'faculty' && link.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Can only delete your own links' });
    }
    await Link.findByIdAndDelete(id);
    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    console.error('Delete link error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting link' });
  }
};
