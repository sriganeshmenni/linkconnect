const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Self-service profile routes
router.get('/me', auth, userController.getMe);
router.patch('/me', auth, userController.updateMeValidators, userController.updateMe);
router.post('/me/password', auth, userController.changePasswordValidators, userController.changePassword);
router.get('/me/logins', auth, userController.getMyLogins);

// Admin-only user management
router.get('/', auth, roleCheck('admin'), userController.getAll);
router.get('/:id', auth, roleCheck('admin'), userController.getById);
router.put('/:id', auth, roleCheck('admin'), userController.update);
router.delete('/:id', auth, roleCheck('admin'), userController.delete);

module.exports = router;
