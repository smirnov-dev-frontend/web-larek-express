import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';

interface IHttpError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: IHttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (isCelebrateError(err)) {
    const message = Array.from(err.details.values())
      .map((detail) => detail.message)
      .join('; ');
    return res.status(400).send({ message });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  return res.status(statusCode).send({ message });
};

export default errorHandler;
