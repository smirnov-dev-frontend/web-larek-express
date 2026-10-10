import { Router } from 'express';
import productRouter from './product';
import orderRouter from './order';
import authRouter from './auth';
import NotFoundError from '../errors/not-found-error';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/auth', authRouter);

router.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));

export default router;
