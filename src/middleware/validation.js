/**
 * Validation Middleware
 * Handles input validation for user registration, login, and post creation
 */

import { body, validationResult } from 'express-validator';

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================

/**
 * Middleware to handle validation errors and render appropriate responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    const errorText = errorMessages.join(', ');
    
    // Return JSON response for API calls
    return res.status(400).json({ 
      success: false, 
      error: errorText,
      errors: errorMessages 
    });
  }
  
  next();
};

// ============================================================================
// USER VALIDATION RULES
// ============================================================================

/**
 * Validation rules for user registration
 */
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// ============================================================================
// POST VALIDATION RULES
// ============================================================================

/**
 * Validation rules for post creation and editing
 */
export const validatePostCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .escape(),
  
  body('body')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Body must be between 10 and 5000 characters')
    .escape(),
  
  handleValidationErrors
];
