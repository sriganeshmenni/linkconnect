const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('student'), submissionController.create);
// Allow student to view self, and faculty/admin to view any student
router.get('/student/:studentId', auth, roleCheck('student', 'faculty', 'admin'), submissionController.getByStudent);
router.get('/link/:linkId', auth, roleCheck('faculty', 'admin'), submissionController.getByLink);
// Submission stats for a link (faculty/admin)
router.get('/link/:linkId/stats', auth, roleCheck('faculty', 'admin'), submissionController.getSubmissionStats);
router.put('/:id/verify', auth, roleCheck('faculty', 'admin'), submissionController.verify);

module.exports = router;

