
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');
const User = require('../models/User');
const StudentLink = require('../models/StudentLink');
const DivisionCatalog = require('../models/DivisionCatalog');

const defaultDivisionCatalog = {
  colleges: [
    {
      code: 'AEC',
      name: 'Aditya Engineering College',
      branches: [
        { code: 'CSE', name: 'Computer Science and Engineering', years: [1, 2, 3, 4], sections: ['A', 'B', 'C'] },
        { code: 'ECE', name: 'Electronics and Communication Engineering', years: [1, 2, 3, 4], sections: ['A', 'B'] },
        { code: 'EEE', name: 'Electrical and Electronics Engineering', years: [1, 2, 3, 4], sections: ['A'] },
      ],
    },
  ],
};

const normalizeStringArray = (input) => {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) return input.map((val) => String(val).trim()).filter(Boolean);
  return String(input)
    .split(',')
    .map((val) => val.trim())
    .filter(Boolean);
};

const normalizeYearArray = (input) => {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) return input.map((val) => Number(val)).filter((val) => !Number.isNaN(val));
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((val) => Number(val.trim()))
      .filter((val) => !Number.isNaN(val));
  }
  const numeric = Number(input);
  return Number.isNaN(numeric) ? [] : [numeric];
};

const buildStudentFilter = (link) => {
  const filter = { role: 'student', active: true };

  if (link.collegeCode) filter.collegeCode = link.collegeCode;
  if (Array.isArray(link.branchCodes) && link.branchCodes.length) filter.branchCode = { $in: link.branchCodes };
  if (Array.isArray(link.years) && link.years.length) filter.year = { $in: link.years };
  if (Array.isArray(link.sections) && link.sections.length) filter.section = { $in: link.sections };

  // Gender is optional; only filter when explicitly provided
  if (Array.isArray(link.allowedGenders) && link.allowedGenders.length) {
    filter.gender = { $in: link.allowedGenders };
  }

  return filter;
};

const assignLinkToStudents = async (link, { reset = false } = {}) => {
  if (reset) {
    await StudentLink.deleteMany({ linkId: link._id });
  }

  const studentFilter = buildStudentFilter(link);
  const students = await User.find(studentFilter).select('_id email');

  if (!students.length) {
    return { assigned: 0 };
  }

  const studentLinkRecords = students.map((student) => ({
    linkId: link._id,
    studentId: student._id,
    studentEmail: student.email,
    assignedAt: new Date(),
  }));

  await StudentLink.insertMany(studentLinkRecords, { ordered: false }).catch((err) => {
    if (err.code !== 11000) console.warn('Student link assignment issue:', err.message);
  });

  return { assigned: students.length };
};

exports.getDivisionCatalog = async (_req, res) => {
  try {
    const catalogDoc = await DivisionCatalog.findOne();
    const catalog = catalogDoc?.colleges?.length ? catalogDoc : defaultDivisionCatalog;
    res.json({ success: true, catalog });
  } catch (err) {
    console.error('Get division catalog error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching division catalog' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const role = (req.user?.role || '').toLowerCase();
    const { q = '', status = 'all', sort = 'createdDesc' } = req.query || {};
    const search = String(q || '').trim().toLowerCase();
    const now = new Date();

    let links;

    if (role === 'admin') {
      links = await Link.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    } else if (role === 'faculty') {
      links = await Link.find({ createdBy: req.user.id }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    } else {
      console.warn('Get all links denied for role:', req.user?.role);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Status filter
    links = links.filter((link) => {
      const isInactive = link.active === false;
      const isExpired = link.deadline ? new Date(link.deadline) < now : false;
      if (status === 'all') return true;
      if (status === 'closed') return isInactive || isExpired;
      // default active
      return !isInactive && !isExpired;
    });

    // Search filter
    if (search) {
      links = links.filter((link) => {
        const haystack = [link.title, link.description, Array.isArray(link.guidelines) ? link.guidelines.join(' ') : '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    // Sort
    links.sort((a, b) => {
      const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      switch (sort) {
        case 'deadlineAsc':
          return deadlineA - deadlineB;
        case 'deadlineDesc':
          return deadlineB - deadlineA;
        case 'createdAsc':
          return createdA - createdB;
        case 'createdDesc':
        default:
          return createdB - createdA;
      }
    });

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

    const { q = '', status = 'active', sort = 'deadlineAsc' } = req.query || {};
    const search = String(q || '').trim().toLowerCase();
    const now = new Date();

    const studentLinks = await StudentLink.find({ studentId })
      .populate({ path: 'linkId', populate: { path: 'createdBy', select: 'name email' } })
      .sort({ assignedAt: -1 });

    let links = studentLinks
      .map((sl) => sl.linkId)
      .filter((link) => !!link);

    // Status filter (active/upcoming vs closed/expired)
    links = links.filter((link) => {
      const isInactive = link.active === false;
      const isExpired = link.deadline ? new Date(link.deadline) < now : false;

      if (status === 'all') return true;
      if (status === 'closed') return isInactive || isExpired;
      // default: active/upcoming
      return !isInactive && !isExpired;
    });

    // Search filter (title/description/guidelines)
    if (search) {
      links = links.filter((link) => {
        const haystack = [link.title, link.description, Array.isArray(link.guidelines) ? link.guidelines.join(' ') : '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    // Sort
    links.sort((a, b) => {
      const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      switch (sort) {
        case 'deadlineDesc':
          return deadlineB - deadlineA;
        case 'createdDesc':
          return createdB - createdA;
        case 'deadlineAsc':
        default:
          return deadlineA - deadlineB;
      }
    });

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
  body('guidelines').optional().isString(),
  body('active').optional().isBoolean(),
  body('collegeCode').optional().isString(),
  body('branchCodes').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('years').optional().custom((val) => Array.isArray(val) || typeof val === 'string' || typeof val === 'number'),
  body('sections').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('allowedGenders').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const creator = await User.findById(req.user.id).select('email collegeCode branchCode year section');
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    const { title, url, shortUrl, deadline, description, guidelines = '', active } = req.body;
    const collegeCode = req.body.collegeCode || creator.collegeCode || 'AEC';
    const branchCodes = normalizeStringArray(req.body.branchCodes ?? creator.branchCode);
    const years = normalizeYearArray(req.body.years ?? creator.year);
    const sections = normalizeStringArray(req.body.sections ?? creator.section);
    const allowedGenders = normalizeStringArray(req.body.allowedGenders);

    const link = new Link({
      title,
      url,
      shortUrl,
      deadline,
      description,
      guidelines,
      active: active ?? true,
      createdBy: req.user.id,
      createdByEmail: creator.email,
      registrations: 0,
      collegeCode,
      branchCodes,
      years,
      sections,
      allowedGenders,
    });

    await link.save();

    const { assigned } = await assignLinkToStudents(link);

    res.status(201).json({ success: true, link, assigned });
  } catch (err) {
    console.error('Create link error:', err);
    res.status(500).json({ success: false, message: 'Server error creating link' });
  }
};

exports.updateValidators = [
  body('title').optional().notEmpty(),
  body('url').optional().isURL(),
  body('description').optional().isString(),
  body('guidelines').optional().isString(),
  body('active').optional().isBoolean(),
  body('collegeCode').optional().isString(),
  body('branchCodes').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('years').optional().custom((val) => Array.isArray(val) || typeof val === 'string' || typeof val === 'number'),
  body('sections').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('allowedGenders').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
];

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;

    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    if (req.user.role === 'faculty' && link.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Can only update your own links' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    let scopeChanged = false;

    if ('collegeCode' in req.body) {
      updateData.collegeCode = req.body.collegeCode || link.collegeCode;
      scopeChanged = true;
    }

    if ('branchCodes' in req.body) {
      updateData.branchCodes = normalizeStringArray(req.body.branchCodes);
      scopeChanged = true;
    }

    if ('years' in req.body) {
      updateData.years = normalizeYearArray(req.body.years);
      scopeChanged = true;
    }

    if ('sections' in req.body) {
      updateData.sections = normalizeStringArray(req.body.sections);
      scopeChanged = true;
    }

    if ('allowedGenders' in req.body) {
      updateData.allowedGenders = normalizeStringArray(req.body.allowedGenders);
      scopeChanged = true;
    }

    const updatedLink = await Link.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedLink) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    if (scopeChanged) {
      await assignLinkToStudents(updatedLink, { reset: true });
    }

    res.json({ success: true, link: updatedLink });
  } catch (err) {
    console.error('Update link error:', err);
    res.status(500).json({ success: false, message: 'Server error updating link' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

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


