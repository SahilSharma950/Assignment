import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generates an access token and a refresh token for the given user ID.
 */
export const generateTokens = (userId: string): AuthTokens => {
  const payload: TokenPayload = { userId };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

/**
 * Verifies the given access token and returns the decoded payload.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

/**
 * Verifies the given refresh token and returns the decoded payload.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
