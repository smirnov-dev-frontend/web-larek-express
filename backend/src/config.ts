import { config } from 'dotenv';
import { StringValue } from 'ms';

config();

export const PORT = Number(process.env.PORT) || 3000;
export const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:5173';

export const AUTH_ACCESS_TOKEN_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET || 'dev-access-secret';
export const AUTH_REFRESH_TOKEN_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
export const AUTH_ACCESS_TOKEN_EXPIRY = (process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m') as StringValue;
export const AUTH_REFRESH_TOKEN_EXPIRY = (process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as StringValue;
