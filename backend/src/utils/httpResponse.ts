import type { Response } from 'express';
import type { PaginatedResult } from '../types/index.js';

/**
 * Standardized HTTP response builders.
 *
 * All responses follow the envelope pattern:
 * {
 *   "success": true|false,
 *   "data": {...},
 *   "message": "optional",
 *   "timestamp": "ISO 8601"
 * }
 */

// ─── Success Responses ─────────────────────────────────────────────────────────

/**
 * Sends a successful JSON response.
 *
 * @example
 * sendSuccess(res, { user }, 'User fetched', 200);
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a 201 Created response.
 */
export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Sends a 204 No Content response.
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Sends a paginated list response.
 *
 * @example
 * sendPaginated(res, { data: users, pagination: { page: 1, ... } });
 */
export const sendPaginated = <T>(
  res: Response,
  result: PaginatedResult<T>,
  message?: string,
): Response => {
  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  });
};

// ─── Error Responses ───────────────────────────────────────────────────────────

/**
 * Sends an error JSON response.
 *
 * @example
 * sendError(res, 'User not found', 404);
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Array<{ field: string; message: string }>,
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
    statusCode,
    timestamp: new Date().toISOString(),
  });
};
