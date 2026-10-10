import {
  Request, Response, NextFunction, CookieOptions,
} from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { Error as MongooseError } from 'mongoose';
import User, { IUser } from '../models/user';
import { ITokenPayload } from '../middlewares/auth';
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
} from '../config';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
};

const createTokens = (_id: string) => ({
  accessToken: jwt.sign({ _id }, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY,
  }),
  refreshToken: jwt.sign({ _id }, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY,
  }),
});

const sendAuthResponse = (
  res: Response,
  user: Pick<IUser, 'email' | 'name'>,
  tokens: ReturnType<typeof createTokens>,
  statusCode = 200,
) => {
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
  });
  return res.status(statusCode).send({
    user: { email: user.email, name: user.name },
    success: true,
    accessToken: tokens.accessToken,
  });
};

const verifyRefreshToken = (token: string) => jwt.verify(
  token,
  AUTH_REFRESH_TOKEN_SECRET,
) as ITokenPayload;

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: Pick<IUser, 'name' | 'email' | 'password'> = req.body;
    const user = await User.create({ name, email, password });
    const tokens = createTokens(user._id.toString());
    await User.findByIdAndUpdate(
      user._id,
      { $push: { tokens: { token: tokens.refreshToken } } },
      { runValidators: true, new: true },
    );
    return sendAuthResponse(res, user, tokens, 201);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: Pick<IUser, 'email' | 'password'> = req.body;
    const user = await User.findUserByCredentials(email, password);
    const tokens = createTokens(user._id.toString());
    await User.findByIdAndUpdate(
      user._id,
      { $push: { tokens: { token: tokens.refreshToken } } },
      { runValidators: true, new: true },
    );
    return sendAuthResponse(res, user, tokens);
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken: string | undefined = req.cookies[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload: ITokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    return next(new UnauthorizedError('Refresh-токен недействителен'));
  }

  try {
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    if (!user.tokens.some(({ token }) => token === refreshToken)) {
      return next(new UnauthorizedError('Refresh-токен недействителен'));
    }
    const tokens = createTokens(user._id.toString());
    await User.findOneAndUpdate(
      { _id: user._id, 'tokens.token': refreshToken },
      { $set: { 'tokens.$.token': tokens.refreshToken } },
      { runValidators: true, new: true },
    );
    return sendAuthResponse(res, user, tokens);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken: string | undefined = req.cookies[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload: ITokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    return next(new UnauthorizedError('Refresh-токен недействителен'));
  }

  try {
    const user = await User.findByIdAndUpdate(
      payload._id,
      { $pull: { tokens: { token: refreshToken } } },
      { runValidators: true, new: true },
    );
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
    return res.send({ success: true });
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Некорректный id пользователя'));
    }
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};
