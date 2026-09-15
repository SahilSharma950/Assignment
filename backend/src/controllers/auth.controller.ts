import type { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/httpResponse.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/AppError.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sets the refresh token as an HTTP-only cookie.
 */
const setRefreshTokenCookie = (res: Response, token: string) => {
  // Parse '7d' etc to milliseconds loosely, or just default to 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000; 

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const { user, tokens } = await authService.register(data);

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(
    res,
    { user, accessToken: tokens.accessToken },
    'Registration successful',
    201
  );
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const { user, tokens } = await authService.login(data);

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(
    res,
    { user, accessToken: tokens.accessToken },
    'Login successful'
  );
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    // Attempt to invalidate token in Redis (ignore errors if token is invalid or user is not logged in)
    try {
      // req.user might not exist if logout is called without access token, 
      // but usually logout is authenticated. If not, we can decode it.
      // Assuming logout is authenticated route:
      if (req.user) {
        await authService.logout(req.user.id, refreshToken);
      }
    } catch (error) {
      // Ignore errors during logout (e.g., token already invalid)
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendSuccess(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token provided');
  }

  const newTokens = await authService.refresh(refreshToken);

  setRefreshTokenCookie(res, newTokens.refreshToken);

  sendSuccess(
    res,
    { accessToken: newTokens.accessToken },
    'Token refreshed successfully'
  );
};
