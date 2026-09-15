import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  // Extends Express Request to carry a typed requestId
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Request ID middleware.
 *
 * Attaches a unique UUID v4 to every incoming request:
 *  - Reads from `X-Request-ID` header if provided by the client/load balancer
 *  - Generates a fresh UUID otherwise
 *
 * The request ID is:
 *  - Added to `req.requestId` for downstream use in controllers/services
 *  - Echoed back in the `X-Request-ID` response header for client-side correlation
 *  - Used in Winston logs to trace a request across its full lifecycle
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const existingId = req.headers['x-request-id'];
  const requestId =
    typeof existingId === 'string' && existingId.length > 0 ? existingId : randomUUID();

  req.requestId = requestId;
  req.startTime = Date.now();

  // Echo the ID back so clients can correlate requests in their logs
  res.setHeader('X-Request-ID', requestId);

  next();
};
