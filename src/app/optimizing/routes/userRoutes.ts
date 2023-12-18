import express from 'express';
import { body } from 'express-validator';
import userController from '../controllers/userController';

const router = express.Router();

router.get('/', userController.getAllUsers);

router.post(
    '/',
    [
        body('name').notEmpty(),
        body('email').isEmail(),
        body('age').isInt({ min: 0 }),
    ],
    userController.createUser
);

export default router;
