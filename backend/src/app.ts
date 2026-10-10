import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import {
  PORT, DB_ADDRESS, ORIGIN_ALLOW, PUBLIC_DIR,
} from './config';
import routes from './routes';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

app.use(requestLogger);
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.use(routes);
app.use(errorLogger);
app.use(errorHandler);

const start = async () => {
  await mongoose.connect(DB_ADDRESS);
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Не удалось подключиться к базе данных', error);
  process.exit(1);
});
