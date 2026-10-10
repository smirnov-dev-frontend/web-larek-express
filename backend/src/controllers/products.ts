import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product, { IProduct } from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveFileFromTemp, removeFile } from '../utils/files';

const handleSaveError = (error: unknown, next: NextFunction) => {
  if (error instanceof MongooseError.ValidationError) {
    return next(new BadRequestError(error.message));
  }
  if (error instanceof Error && error.message.includes('E11000')) {
    return next(new ConflictError('Товар с таким названием уже существует'));
  }
  return next(error);
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Product.find({});
    return res.send({ items, total: items.length });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    }: IProduct = req.body;
    await moveFileFromTemp(image.fileName);
    const product = await Product.create({
      title, image, category, description, price,
    });
    return res.status(201).send(product);
  } catch (error) {
    return handleSaveError(error, next);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Partial<IProduct> = req.body;
    const current = await Product.findById(req.params.productId);
    if (!current) {
      return next(new NotFoundError('Товар не найден'));
    }
    if (data.image) {
      await moveFileFromTemp(data.image.fileName);
    }
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      data,
      { runValidators: true, new: true },
    );
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    if (data.image && data.image.fileName !== current.image.fileName) {
      await removeFile(current.image.fileName);
    }
    return res.send(product);
  } catch (error) {
    return handleSaveError(error, next);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    return res.send(product);
  } catch (error) {
    return next(error);
  }
};
