const express = require('express');
const router = express.Router();
const { getAllInterests, getCategories, addCustomInterest } = require('../services/interestService');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { customInterestSchema } = require('../validators/schemas');
const { successResponse } = require('../utils/apiResponse');

router.get('/', async (req, res, next) => {
  try {
    const interests = await getAllInterests();
    return successResponse(res, 200, 'Interests retrieved', interests);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', (req, res) => {
  const categories = getCategories();
  return successResponse(res, 200, 'Categories retrieved', categories);
});

router.post('/custom', authenticate, validate(customInterestSchema), async (req, res, next) => {
  try {
    const { description } = req.body;
    const name = description.slice(0, 30).trim();
    const created = await addCustomInterest(name, description, 'Custom');
    return successResponse(res, 201, 'Custom interest registered', created);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
