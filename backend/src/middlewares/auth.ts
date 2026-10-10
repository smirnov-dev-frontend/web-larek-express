import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface ITokenPayload {
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as ITokenPayload;
  } catch (_error) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  return next();
};

export default auth;
