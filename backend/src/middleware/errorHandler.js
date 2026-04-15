const logger = require('../config/logger');
const { sendError, sendConflict, sendNotFound, sendUnauthorized } = require('./responseFormatter');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name,
    path: req.path,
    method: req.method
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return sendConflict(res, 'A record with this value already exists', {
      field: err.meta?.target?.join(', ') || 'unknown',
      constraint: err.meta?.constraint
    });
  }

  if (err.code === 'P2025') {
    return sendNotFound(res, 'Record not found', {
      model: err.meta?.modelName,
      identifier: err.meta?.cause
    });
  }

  if (err.code === 'P2003') {
    return sendError(res, 400, 'Foreign key constraint failed', {
      field: err.meta?.field_name,
      constraint: err.meta?.constraint
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendUnauthorized(res, 'Invalid or malformed token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendUnauthorized(res, 'Token has expired. Please login again', {
      expiredAt: err.expiredAt
    });
  }

  if (err.name === 'NotBeforeError') {
    return sendUnauthorized(res, 'Token not yet valid');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, 400, err.message, {
      details: err.details
    });
  }

  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return sendConflict(res, `A record with this ${field} already exists`, {
        field,
        value: err.keyValue[field]
      });
    }
  }

  if (err.name === 'MongooseError') {
    return sendError(res, 400, 'Database operation failed', {
      message: err.message
    });
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.message.match(/for key '(.+?)'/);
    const field = match ? match[1] : 'unknown';
    return sendConflict(res, `A record with this ${field} already exists`, { field });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(res, 400, 'Referenced record does not exist');
  }

  // Custom application errors
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message, {
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.details && { details: err.details })
    });
  }

  // Default error
  const isDevelopment = process.env.NODE_ENV === 'development';
  return sendError(res, 500, 'Internal server error', {
    ...(isDevelopment && { 
      stack: err.stack,
      message: err.message 
    }),
    ...(!isDevelopment && { 
      requestId: req.id || 'unknown' 
    })
  });
};

module.exports = errorHandler;
