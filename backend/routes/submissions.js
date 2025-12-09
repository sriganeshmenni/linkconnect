const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('student'), submissionController.create);
router.get('/student/:studentId', auth, roleCheck('student'), submissionController.getByStudent);
router.get('/link/:linkId', auth, roleCheck('faculty', 'admin'), submissionController.getByLink);
router.put('/:id/verify', auth, roleCheck('faculty', 'admin'), submissionController.verify);

module.exports = router;
