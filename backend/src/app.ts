import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);

const start = async () => {
  await mongoose.connect(DB_ADDRESS);
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
};

start();
