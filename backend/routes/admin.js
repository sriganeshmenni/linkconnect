const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

router.use(auth, roleCheck('admin'));

router.patch('/users/:id/status', adminController.toggleUserStatus);
router.post('/users/:id/reset-password', adminController.resetUserPassword);
router.post('/users/:id/force-logout', adminController.forceLogoutUser);
router.get('/users/:id/activity', adminController.getUserActivity);
router.get('/users/activity/search', adminController.searchUserActivity);
router.patch('/links/:id/active', adminController.toggleLinkActive);
router.get('/rate-limit', adminController.getRateLimit);
router.post('/rate-limit', adminController.updateRateLimit);
router.get('/divisions', adminController.getDivisionCatalog);
router.post('/divisions', adminController.saveDivisionCatalog);
router.post('/users', adminController.createUserValidators, adminController.createUser);
router.post('/users/bulk', adminController.bulkCreateUsers);

module.exports = router;
