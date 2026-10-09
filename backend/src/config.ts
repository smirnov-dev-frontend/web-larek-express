import { config } from 'dotenv';

config();

export const PORT = Number(process.env.PORT) || 3000;
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:5173';
