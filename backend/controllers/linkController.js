
// Link Controller
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');

exports.getAll = async (req, res) => {
  try {
    // All authenticated users can view links
    const links = await Link.find();
    res.json({ success: true, links });
  } catch (err) {
    console.error('Get all links error:', err);
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
    const { title, url, description, active } = req.body;
    const link = new Link({ title, url, description, active: active ?? true, createdBy: req.user.id });
    await link.save();
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
    // Only admin can delete links
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const link = await Link.findByIdAndDelete(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    console.error('Delete link error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting link' });
  }
};
