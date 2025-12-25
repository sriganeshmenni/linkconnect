const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/users', auth, roleCheck('admin'), exportController.exportUsers);
router.get('/links', auth, roleCheck('admin'), exportController.exportLinks);
router.get('/submissions', auth, roleCheck('admin'), exportController.exportSubmissions);
router.get('/logins', auth, roleCheck('admin'), exportController.exportLogins);

module.exports = router;

