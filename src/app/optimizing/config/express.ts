import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ConnectOptions } from 'mongoose';
import { UserRouter } from '../routes/user';
import { limiter } from '../middleware/rateLimit';

const app = express();
const port = 3000;

app.use(bodyParser.json());

const uri = 'mongodb://localhost:27017/mydb';

const mongooseOptions: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
} as any;

mongoose.connect(uri, mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use('/users', limiter);
app.use('/users', UserRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
