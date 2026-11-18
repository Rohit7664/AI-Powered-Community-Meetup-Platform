const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { activitySchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/nearby', activityController.getNearbyActivities);
router.get('/group/:id', activityController.getGroupActivities);
router.post('/group/:id', validate(activitySchema), activityController.createActivity);
router.post('/:id/join', activityController.joinActivity);
router.post('/:id/leave', activityController.leaveActivity);

module.exports = router;
