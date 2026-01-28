import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-development-only';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
export const signRefreshToken = (payload: object) => jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

export const verifyToken = (token: string) => {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
};
export const verifyRefreshToken = (token: string) => {
  try { return jwt.verify(token, REFRESH_TOKEN_SECRET); } catch { return null; }
};

// Helper to read auth token from either cookies or Authorization header
export const getAuthToken = async (request: Request): Promise<string | null> => {
  try {
    const jar = await cookies();
    const cookieToken = jar.get('token')?.value;
    if (cookieToken) return cookieToken;
  } catch {}
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return null;
};
