const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stats', auth, roleCheck('admin'), analyticsController.getStats);
router.get('/logins', auth, roleCheck('admin'), analyticsController.getLogins);

module.exports = router;
