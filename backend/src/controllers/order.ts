import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

export interface IOrder {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, total }: IOrder = req.body;
    const products = await Product.find({ _id: { $in: items } });
    const prices = new Map(products.map((product) => [product._id.toString(), product.price]));

    let sum = 0;
    for (let i = 0; i < items.length; i += 1) {
      const price = prices.get(items[i]);
      if (price === undefined) {
        return next(new BadRequestError(`Товар с id ${items[i]} не найден`));
      }
      if (price === null) {
        return next(new BadRequestError(`Товар с id ${items[i]} не продаётся`));
      }
      sum += price;
    }

    if (sum !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    return res.send({ id: faker.string.uuid(), total });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
