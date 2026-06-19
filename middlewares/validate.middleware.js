const { errorResponse } = require('../helpers/response.helper');

exports.validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return errorResponse(res, errorMessage, 400);
    }

    req[source] = value; // Replace req data with validated and sanitized data
    next();
  };
};
