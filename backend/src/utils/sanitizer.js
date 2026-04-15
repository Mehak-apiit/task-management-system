/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user input and prevent XSS attacks
 */

const xss = require('xss');

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

/**
 * Sanitize an object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = Array.isArray(value) 
          ? value.map(item => typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item))
          : sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
};

/**
 * Trim and sanitize string
 * @param {string} str - String to trim and sanitize
 * @returns {string} - Trimmed and sanitized string
 */
const trimAndSanitize = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeString(str.trim());
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate and sanitize
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  const sanitized = trimAndSanitize(email).toLowerCase();
  return sanitized;
};

/**
 * Remove special characters from string (keep alphanumeric, spaces, and basic punctuation)
 * @param {string} str - String to clean
 * @returns {string} - Cleaned string
 */
const removeSpecialChars = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[^a-zA-Z0-9\s.,!?@_-]/g, '');
};

/**
 * Sanitize SQL-like patterns to prevent SQL injection (additional layer)
 * @param {string} str - String to check
 * @returns {string} - Sanitized string
 */
const sanitizeSql = (str) => {
  if (typeof str !== 'string') return str;
  // Remove common SQL injection patterns
  return str
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/gi, '')
    .replace(/(--|;|\/\*|\*\/|xp_|sp_)/g, '');
};

/**
 * Sanitize MongoDB NoSQL injection patterns
 * @param {string} str - String to check
 * @returns {string} - Sanitized string
 */
const sanitizeNoSql = (str) => {
  if (typeof str !== 'string') return str;
  // Remove common NoSQL injection patterns
  return str
    .replace(/\$where|\$ne|\$gt|\$lt|\$in|\$or|\$and/g, '')
    .replace(/(\{|\}|\[|\])/g, '');
};

/**
 * Comprehensive sanitization for user input
 * @param {string} str - String to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (str, options = {}) => {
  if (typeof str !== 'string') return str;

  let sanitized = str;

  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  if (options.xss !== false) {
    sanitized = sanitizeString(sanitized);
  }

  if (options.removeSpecialChars) {
    sanitized = removeSpecialChars(sanitized);
  }

  if (options.sanitizeSql) {
    sanitized = sanitizeSql(sanitized);
  }

  if (options.sanitizeNoSql) {
    sanitized = sanitizeNoSql(sanitized);
  }

  if (options.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  if (options.uppercase) {
    sanitized = sanitized.toUpperCase();
  }

  return sanitized;
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  trimAndSanitize,
  sanitizeEmail,
  removeSpecialChars,
  sanitizeSql,
  sanitizeNoSql,
  sanitizeInput
};
