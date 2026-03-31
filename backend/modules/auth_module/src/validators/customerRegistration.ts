import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware';

export const customerRegistrationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\+?[0-9]{9,15}$/).withMessage('Invalid phone number format'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).withMessage('Password must be 8+ chars with upper, lower, number, special'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('interests').isArray({ min: 3 }).withMessage('Select at least 3 interests'),
  handleValidationErrors,
];