import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware';

export const businessRegistrationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\+?[0-9]{9,15}$/).withMessage('Invalid phone number format'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).withMessage('Password must be 8+ chars with upper, lower, number, special'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name is required'),
  body('businessCategory').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('businessType').isIn(['RETAIL', 'SERVICE', 'RESTAURANT', 'ONLINE']).withMessage('Invalid business type'),
  handleValidationErrors,
];