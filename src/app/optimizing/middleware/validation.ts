import { check } from 'express-validator';

const userValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('age').isNumeric().withMessage('Age must be a number'),
];

export { userValidation };
