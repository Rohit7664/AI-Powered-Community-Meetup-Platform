const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', groupController.getAllGroups);
router.get('/my', groupController.getMyGroups);
router.get('/recommended', groupController.getRecommended);
router.get('/:id', groupController.getById);
router.get('/:id/members', groupController.getMembers);
router.post('/:id/leave', groupController.leave);

module.exports = router;
