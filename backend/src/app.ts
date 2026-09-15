import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// ─── App Factory ───────────────────────────────────────────────────────────────
export const app: Express = express();

// ─── Trust Proxy (for rate limiting behind load balancer) ─────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  }),
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
});
app.use('/api', globalLimiter);

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg: string) => logger.http(msg.trimEnd()) },
    skip: () => env.NODE_ENV === 'test',
  }),
);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
  });
});

// ─── API Routes (registered per task) ────────────────────────────────────────
// Routes will be registered here in future tasks:
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/workspaces', workspaceRouter);
// app.use('/api/v1/boards', boardRouter);
// app.use('/api/v1/documents', documentRouter);
// app.use('/api/v1/chat', chatRouter);

// ─── Swagger UI (registered per task) ────────────────────────────────────────
// Will be configured in future tasks

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
    timestamp: new Date().toISOString(),
  });
});
