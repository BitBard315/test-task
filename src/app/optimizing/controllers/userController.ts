import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import winston from 'winston';

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await User.find({});
            res.json(users);
        } catch (err) {
            logger.error(err);
            res.status(500).send('Internal server error');
        }
    },

    createUser: async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const newUser = new User(req.body);
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch (err) {
            logger.error(err);
            res.status(500).send('Internal server error');
        }
    },
};

export default userController;
