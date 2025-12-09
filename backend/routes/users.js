const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('admin'), userController.getAll);
router.get('/:id', auth, roleCheck('admin'), userController.getById);
router.put('/:id', auth, roleCheck('admin'), userController.update);
router.delete('/:id', auth, roleCheck('admin'), userController.delete);

module.exports = router;
