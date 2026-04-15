const logger = require('../config/logger');

/**
 * Standard API response format
 * Ensures consistent response structure across all endpoints
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Detailed error object
 */
const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  // Log error for debugging
  if (statusCode >= 500) {
    logger.error(`API Error [${statusCode}]: ${message}`, errors);
  } else {
    logger.warn(`API Warning [${statusCode}]: ${message}`);
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {object} errors - Validation errors
 */
const sendValidationError = (res, message = 'Validation failed', errors = null) => {
  return sendError(res, 400, message, errors);
};

/**
 * Send unauthorized response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

/**
 * Send forbidden response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

/**
 * Send not found response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

/**
 * Send conflict response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(res, 409, message);
};

/**
 * Send created response
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Send no content response
 * @param {object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).json({
    success: true,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {object} data - Response data
 * @param {object} pagination - Pagination info
 */
const sendPaginated = (res, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(200).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendCreated,
  sendNoContent,
  sendPaginated
};
