const { body, validationResult } = require('express-validator');

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a more detailed error message
    const errorMessages = errors.array().map((e) => ({
      field: e.param,
      message: e.msg,
    }));
    
    return res.status(400).json({
      success: false,
      message: errorMessages[0]?.message || 'Validation failed',
      errors: errorMessages,
    });
  }
  next();
};

// Auth validations
exports.registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .trim(),
  validate,
];

exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Plant validations
exports.plantValidation = [
  body('name')
    .notEmpty()
    .withMessage('Plant name is required')
    .trim(),
  body('gardenId')
    .notEmpty()
    .withMessage('Garden ID is required')
    .isMongoId()
    .withMessage('Invalid garden ID'),
  validate,
];

// Garden validations
exports.gardenValidation = [
  body('name')
    .notEmpty()
    .withMessage('Garden name is required')
    .trim(),
  validate,
];

// Community post validations
exports.postValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .trim(),
  validate,
];

// Schedule validations
exports.scheduleValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),
  body('dueDate')
    .isISO8601()
    .withMessage('Invalid due date format'),
  validate,
];