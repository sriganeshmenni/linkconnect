const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public endpoint to track visits (login/registration page loads)
router.post('/visits/track', analyticsController.trackVisit);

router.get('/stats', auth, roleCheck('faculty', 'admin'), analyticsController.getStats);
router.get('/logins', auth, roleCheck('faculty', 'admin'), analyticsController.getLogins);
router.get('/visits', auth, roleCheck('admin'), analyticsController.getVisits);

module.exports = router;

