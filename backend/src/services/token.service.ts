import { redisClient } from '../config/redis.js';
import { UnauthorizedError } from '../utils/AppError.js';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { generateTokens, AuthTokens } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';

class TokenService {
  /**
   * Hashes a token for secure storage.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Helper to parse '15m', '7d' into milliseconds or seconds.
   * If parsing fails, defaults to 7 days in seconds.
   */
  private parseExpiryToSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60; // 7 days default
    const value = parseInt(match[1] as string, 10);
    const unit = match[2] as string;
    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: return 7 * 24 * 60 * 60;
    }
  }

  /**
   * Saves a refresh token to Redis with a TTL.
   */
  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const ttl = this.parseExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN);
    
    // Store as `refresh_token:<userId>:<hash>` -> 'valid'
    const key = `refresh_token:${userId}:${tokenHash}`;
    await redisClient.set(key, 'valid', 'EX', ttl);
  }

  /**
   * Verifies an incoming refresh token, deletes it (rotation), and issues new tokens.
   */
  async rotateTokens(token: string, userId: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(token);
    const key = `refresh_token:${userId}:${tokenHash}`;

    const exists = await redisClient.get(key);

    if (!exists) {
      // Token doesn't exist (invalid, expired, or already used)
      // If we wanted aggressive reuse detection, we could revoke ALL tokens for the user here.
      // But for now, we just reject the request.
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Delete the old token (rotate)
    await redisClient.del(key);

    // Verify user still exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    // Issue new tokens
    const newTokens = generateTokens(userId);

    // Save the new refresh token
    await this.saveRefreshToken(userId, newTokens.refreshToken);

    return newTokens;
  }

  /**
   * Revokes a specific refresh token (used during normal logout).
   */
  async revokeToken(userId: string, token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const key = `refresh_token:${userId}:${tokenHash}`;
    await redisClient.del(key);
  }

  /**
   * Revokes all refresh tokens for a user (e.g., password change, explicit "log out everywhere").
   */
  async revokeAllTokens(userId: string): Promise<void> {
    const keys = await redisClient.keys(`refresh_token:${userId}:*`);
    if (keys.length > 0) {
      // In Redis cluster, del with multiple keys might fail if they are on different slots,
      // but here they all have the same prefix so it's fine, or we can pipeline.
      const pipeline = redisClient.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }
  }
}

export const tokenService = new TokenService();
