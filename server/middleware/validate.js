const { z } = require('zod');
const { sendError } = require('../utils/httpResponses');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || [];
      const formattedErrors = issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', { errors: formattedErrors });
    }
    next(err);
  }
};

module.exports = { validate };
