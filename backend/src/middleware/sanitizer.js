const { sanitizeObject, sanitizeInput } = require('../utils/sanitizer');
const logger = require('../config/logger');

/**
 * Middleware to sanitize request body, query, and params
 * Protects against XSS and injection attacks
 */
const sanitizeInputMiddleware = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      // Only sanitize string params, keep IDs as-is
      for (const key in req.params) {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeInput(req.params[key], { xss: true, trim: true });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    // Continue even if sanitization fails, but log the error
    next();
  }
};

/**
 * Middleware to sanitize specific fields in request body
 * @param {Array<string>} fields - Array of field names to sanitize
 */
const sanitizeFields = (fields) => {
  return (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = sanitizeInput(req.body[field], { xss: true, trim: true });
          }
        });
      }
      next();
    } catch (error) {
      logger.error('Field sanitization error:', error);
      next();
    }
  };
};

module.exports = {
  sanitizeInputMiddleware,
  sanitizeFields
};
