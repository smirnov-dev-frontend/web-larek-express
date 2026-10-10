import { Router } from 'express';
import productRouter from './product';
import orderRouter from './order';
import NotFoundError from '../errors/not-found-error';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);

router.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));

export default router;
