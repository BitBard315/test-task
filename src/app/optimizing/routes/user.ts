import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { User } from '../models/user';

const UserRouter = Router();

UserRouter.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

UserRouter.post('/', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('age').isNumeric().withMessage('Age must be a number'),
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

export { UserRouter };
