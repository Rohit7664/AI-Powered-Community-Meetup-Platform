const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', invitationController.getInvitations);
router.post('/:id/accept', invitationController.accept);
router.post('/:id/reject', invitationController.reject);

module.exports = router;
