import type { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/httpResponse.js';
import { env } from '../config/env.js';

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

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendSuccess(res, null, 'Logged out successfully');
};
