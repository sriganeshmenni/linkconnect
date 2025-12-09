const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, linkController.getAll);
router.get('/:id', auth, linkController.getById);
router.post('/', auth, roleCheck('faculty', 'admin'), linkController.create);
router.put('/:id', auth, roleCheck('faculty', 'admin'), linkController.update);
router.delete('/:id', auth, roleCheck('faculty', 'admin'), linkController.delete);

module.exports = router;
