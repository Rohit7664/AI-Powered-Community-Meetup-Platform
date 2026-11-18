const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { messageSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/:id/messages', messageController.getGroupMessages);
router.post('/:id/messages', validate(messageSchema), messageController.sendGroupMessage);

module.exports = router;
