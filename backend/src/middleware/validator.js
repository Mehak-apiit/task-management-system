const Joi = require('joi');
const { sendValidationError } = require('./responseFormatter');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return sendValidationError(res, 'Validation failed. Please check your input.', errors);
    }
    
    next();
  };
};

const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required',
      'string.max': 'Email must not exceed 255 characters'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('USER', 'ADMIN')
    .uppercase()
    .optional()
    .messages({
      'any.only': 'Role must be either USER or ADMIN'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required'
    })
});

const taskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must not exceed 200 characters',
      'string.empty': 'Title cannot be empty',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    })
});

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must not exceed 200 characters'
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  taskSchema,
  updateTaskSchema
};
