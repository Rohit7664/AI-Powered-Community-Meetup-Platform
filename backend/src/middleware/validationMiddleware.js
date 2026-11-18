const { errorResponse } = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, 400, 'Validation failed', formattedErrors);
      }
      return errorResponse(res, 400, err.message);
    }
  };
};

module.exports = { validate };
