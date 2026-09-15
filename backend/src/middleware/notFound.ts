import type { Request, Response } from 'express';
import { sendError } from '../utils/httpResponse.js';

/**
 * 404 Not Found handler.
 *
 * Registered AFTER all routes. Catches any request that didn't match
 * a defined route and returns a consistent JSON 404 response.
 *
 * IMPORTANT: Must be registered BEFORE the errorHandler middleware.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route '${req.method} ${req.originalUrl}' not found`, 404);
};
