import type { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/httpResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Global error handling middleware.
 *
 * Catches ALL errors thrown by controllers/services (via express-async-errors)
 * and maps them to consistent JSON responses.
 *
 * Error hierarchy handled:
 *  1. AppError       — our own operational errors (4xx/5xx)
 *  2. ZodError       — Zod validation failures → 422
 *  3. MongooseError  — DB validation & cast errors → 400/422
 *  4. JsonWebToken   — JWT auth errors → 401
 *  5. SyntaxError    — Malformed JSON body → 400
 *  6. Unknown        — Unexpected errors → 500
 *
 * IMPORTANT: Must be registered as the LAST middleware in app.ts (4 params).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // ─── AppError (Operational) ────────────────────────────────────────────────
  if (err instanceof AppError) {
    logger.warn(`[${req.requestId ?? 'NO-ID'}] AppError ${err.statusCode}: ${err.message}`);
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // ─── Zod Validation Error ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn(`[${req.requestId ?? 'NO-ID'}] ZodError: ${JSON.stringify(errors)}`);
    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  // ─── Mongoose Validation Error ────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn(`[${req.requestId ?? 'NO-ID'}] MongooseValidationError: ${err.message}`);
    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  // ─── Mongoose CastError (invalid ObjectId, etc.) ─────────────────────────
  if (err instanceof MongooseError.CastError) {
    logger.warn(`[${req.requestId ?? 'NO-ID'}] MongooseCastError: ${err.message}`);
    sendError(res, `Invalid value for field '${err.path}'`, 400);
    return;
  }

  // ─── JWT TokenExpiredError ─────────────────────────────────────────────────
  if (err instanceof jwt.TokenExpiredError) {
    logger.warn(`[${req.requestId ?? 'NO-ID'}] TokenExpiredError`);
    sendError(res, 'Token has expired — please log in again', 401);
    return;
  }

  // ─── JWT JsonWebTokenError ────────────────────────────────────────────────
  if (err instanceof jwt.JsonWebTokenError) {
    logger.warn(`[${req.requestId ?? 'NO-ID'}] JsonWebTokenError: ${err.message}`);
    sendError(res, 'Invalid token', 401);
    return;
  }

  // ─── Malformed JSON Body ──────────────────────────────────────────────────
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn(`[${req.requestId ?? 'NO-ID'}] SyntaxError (malformed JSON body)`);
    sendError(res, 'Malformed JSON in request body', 400);
    return;
  }

  // ─── MongoDB Duplicate Key Error ──────────────────────────────────────────
  // Mongoose doesn't export a typed DuplicateKeyError — check error code
  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0] ?? 'field';
    logger.warn(`[${req.requestId ?? 'NO-ID'}] MongoDB DuplicateKey: ${field}`);
    sendError(res, `${field} already exists`, 409);
    return;
  }

  // ─── Unknown / Programming Error ──────────────────────────────────────────
  logger.error(`[${req.requestId ?? 'NO-ID'}] Unhandled error:`, {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message;

  sendError(res, message, 500);
};
