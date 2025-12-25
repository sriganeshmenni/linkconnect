const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, linkController.getAll);
router.get('/divisions', auth, linkController.getDivisionCatalog);
router.get('/student/my-links', auth, roleCheck('student'), linkController.getStudentLinks);
router.get('/:id', auth, linkController.getById);
router.post('/', auth, roleCheck('faculty', 'admin'), linkController.createValidators, linkController.create);
router.put('/:id', auth, roleCheck('faculty', 'admin'), linkController.updateValidators, linkController.update);
router.delete('/:id', auth, roleCheck('faculty', 'admin'), linkController.delete);

module.exports = router;
