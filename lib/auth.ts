import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

export const hashPassword = async (pass: string) => await bcrypt.hash(pass, 10);

export const verifyPassword = async (pass: string, hash: string) => await bcrypt.compare(pass, hash);

export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, role_ids: user.role_ids },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};