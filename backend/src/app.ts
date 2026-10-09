import express from 'express';
import cors from 'cors';
import { PORT, ORIGIN_ALLOW } from './config';

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW }));

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
