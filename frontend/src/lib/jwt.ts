import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET!;

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

interface TokenPayload {
  id: string;
  [key: string]: any;
}

export const signToken = (
  payload: TokenPayload,
  expiresIn: string,
  isAdmin = true
): Promise<string> => {
  return sign(
    payload,
    isAdmin ? JWT_ADMIN_SECRET : JWT_SECRET,
    { expiresIn }
  ) as Promise<string>;
};

export const verifyToken = async (
  token: string,
  isAdmin = true
): Promise<TokenPayload> => {
  try {
    return (await verify(
      token,
      isAdmin ? JWT_ADMIN_SECRET : JWT_SECRET
    )) as TokenPayload;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

// Admin-specific token validation
export const verifyAdminToken = (token: string) => verifyToken(token, true);