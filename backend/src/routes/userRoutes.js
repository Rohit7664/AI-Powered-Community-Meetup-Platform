const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  profileUpdateSchema,
  interestUpdateSchema,
  locationUpdateSchema,
} = require('../validators/schemas');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(profileUpdateSchema), userController.updateProfile);
router.put('/interests', validate(interestUpdateSchema), userController.updateInterests);
router.put('/location', validate(locationUpdateSchema), userController.updateLocation);
router.get('/matches', userController.getMatches);

module.exports = router;
