
// // Link Controller
// const { body, validationResult } = require('express-validator');
// const Link = require('../models/Link');
// const User = require('../models/User');
// const StudentLink = require('../models/StudentLink');

// exports.getAll = async (req, res) => {
//   try {
//     // All authenticated users can view links
//     const links = await Link.find().sort({ createdAt: -1 });
//     res.json({ success: true, links });
//   } catch (err) {
//     console.error('Get all links error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching links' });
//   }
// };

// // Get links for a specific student
// exports.getStudentLinks = async (req, res) => {
//   try {
//     const studentId = req.user.id;
    
//     // Get all StudentLink records for this student with populated link data
//     const studentLinks = await StudentLink.find({ studentId })
//       .populate('linkId')
//       .sort({ assignedAt: -1 });
    
//     // Extract just the links and mark as viewed
//     const links = studentLinks.map(sl => sl.linkId);
    
//     res.json({ success: true, links });
//   } catch (err) {
//     console.error('Get student links error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching links' });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const link = await Link.findById(id);
//     if (!link) {
//       return res.status(404).json({ success: false, message: 'Link not found' });
//     }
//     res.json({ success: true, link });
//   } catch (err) {
//     console.error('Get link by ID error:', err);
//     res.status(500).json({ success: false, message: 'Server error fetching link' });
//   }
// };

// exports.createValidators = [
//   body('title').notEmpty().withMessage('Title is required'),
//   body('url').isURL().withMessage('Valid URL required'),
//   body('shortUrl').notEmpty().withMessage('Short URL is required'),
//   body('deadline').notEmpty().isISO8601().withMessage('Valid deadline is required'),
//   body('description').optional().isString(),
//   body('active').optional().isBoolean()
// ];

// exports.create = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }
//   try {
//     // Only faculty and admin can create links
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const { title, url, shortUrl, deadline, description, active } = req.body;
//     const link = new Link({
//       title,
//       url,
//       shortUrl,
//       deadline,
//       description,
//       active: active ?? true,
//       createdBy: req.user.id,
//       createdByEmail: req.user.email,
//       registrations: 0
//     });
//     await link.save();

//     // Push this link to all students in the database
//     try {
//       const allStudents = await User.find({ role: 'student' });
      
//       if (allStudents.length > 0) {
//         const studentLinkRecords = allStudents.map(student => ({
//           linkId: link._id,
//           studentId: student._id,
//           studentEmail: student.email,
//           assignedAt: new Date()
//         }));
        
//         // Bulk insert with ignoring duplicates (shouldn't happen on creation, but safe)
//         await StudentLink.insertMany(studentLinkRecords, { ordered: false }).catch(err => {
//           // Ignore duplicate key errors, log others
//           if (err.code !== 11000) {
//             console.warn('Warning during student link assignment:', err.message);
//           }
//         });
        
//         console.log(`✓ Link "${title}" pushed to ${allStudents.length} students`);
//       }
//     } catch (pushError) {
//       console.warn('Error pushing link to students:', pushError);
//       // Don't fail the link creation if push fails, but log it
//     }

//     res.status(201).json({ success: true, link });
//   } catch (err) {
//     console.error('Create link error:', err);
//     res.status(500).json({ success: false, message: 'Server error creating link' });
//   }
// };

// exports.updateValidators = [
//   body('title').optional().notEmpty().withMessage('Title cannot be empty'),
//   body('url').optional().isURL().withMessage('Valid URL required'),
//   body('description').optional().isString(),
//   body('active').optional().isBoolean()
// ];

// exports.update = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }
//   try {
//     const { id } = req.params;
//     // Only faculty and admin can update links
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const updateData = { ...req.body };
//     const link = await Link.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
//     if (!link) {
//       return res.status(404).json({ success: false, message: 'Link not found' });
//     }
//     res.json({ success: true, link });
//   } catch (err) {
//     console.error('Update link error:', err);
//     res.status(500).json({ success: false, message: 'Server error updating link' });
//   }
// };

// exports.delete = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // Faculty and admin can delete links
//     if (!['admin', 'faculty'].includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     const link = await Link.findById(id);
//     if (!link) {
//       return res.status(404).json({ success: false, message: 'Link not found' });
//     }
//     // Faculty can only delete their own links, admin can delete any
//     if (req.user.role === 'faculty' && link.createdBy.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: 'Can only delete your own links' });
//     }
//     await Link.findByIdAndDelete(id);
//     res.json({ success: true, message: 'Link deleted' });
//   } catch (err) {
//     console.error('Delete link error:', err);
//     res.status(500).json({ success: false, message: 'Server error deleting link' });
//   }
// };

// Link Controller
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
    let links;

    if (role === 'admin') {
      // Admin sees ALL links
      links = await Link.find().sort({ createdAt: -1 });
    } else if (role === 'faculty') {
      // Faculty sees ONLY their own links
      links = await Link.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    } else {
      console.warn('Get all links denied for role:', req.user?.role);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

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

    const studentLinks = await StudentLink.find({ studentId })
      .populate('linkId')
      .sort({ assignedAt: -1 });

    const links = studentLinks
      .map((sl) => sl.linkId)
      .filter((link) => link && link.active !== false);

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
  body('active').optional().isBoolean(),
  body('collegeCode').optional().isString(),
  body('branchCodes').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('years').optional().custom((val) => Array.isArray(val) || typeof val === 'string' || typeof val === 'number'),
  body('sections').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
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

    const { title, url, shortUrl, deadline, description, active } = req.body;
    const collegeCode = req.body.collegeCode || creator.collegeCode || 'AEC';
    const branchCodes = normalizeStringArray(req.body.branchCodes ?? creator.branchCode);
    const years = normalizeYearArray(req.body.years ?? creator.year);
    const sections = normalizeStringArray(req.body.sections ?? creator.section);

    const link = new Link({
      title,
      url,
      shortUrl,
      deadline,
      description,
      active: active ?? true,
      createdBy: req.user.id,
      createdByEmail: creator.email,
      registrations: 0,
      collegeCode,
      branchCodes,
      years,
      sections,
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
  body('active').optional().isBoolean(),
  body('collegeCode').optional().isString(),
  body('branchCodes').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
  body('years').optional().custom((val) => Array.isArray(val) || typeof val === 'string' || typeof val === 'number'),
  body('sections').optional().custom((val) => Array.isArray(val) || typeof val === 'string'),
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


