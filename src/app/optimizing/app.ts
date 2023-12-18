import express, { Express } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import userRoutes from './routes/userRoutes';

const app: Express = express();

app.use(bodyParser.json());

const uri = 'mongodb://localhost:27017/mydb';

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).send('Internal server error');
};

app.use(errorHandler);

app.use('/users', userRoutes);

export default app;
