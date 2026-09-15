import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { IUser } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware to protect routes that require authentication.
 * Verifies the JWT access token in the Authorization header.
 */
export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication required. Please provide a Bearer token.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Authentication required. Invalid Bearer token format.');
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired. Please log in again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token.');
    }
    next(error);
  }
};
