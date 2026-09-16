import 'express-async-errors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.route.js';
import { authRoute } from './routes/auth.route.js';
import { workspaceRoute } from './routes/workspace.route.js';
import { boardRoute } from './routes/board.route.js';
import { listRoute } from './routes/list.route.js';
import { taskRoute } from './routes/task.route.js';
import commentRoute from './routes/comment.routes.js';
import attachmentRoute from './routes/attachment.routes.js';
import chatRoute from './routes/chat.routes.js';
import notificationRoute from './routes/notification.routes.js';

// ─── App Factory ───────────────────────────────────────────────────────────────
export const app: Express = express();

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// Required for accurate IP detection behind load balancers (rate limiting, logging)
app.set('trust proxy', 1);

// ─── Request ID ───────────────────────────────────────────────────────────────
// Must be first — downstream middleware + controllers use req.requestId
app.use(requestIdMiddleware);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],   // Swagger UI needs inline styles
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,              // Swagger UI asset loading
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (env.CORS_ORIGIN.includes(origin) || env.CORS_ORIGIN.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }),
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Applied only to /api to avoid rate-limiting the health check root and docs
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.requestId ?? req.ip ?? 'unknown',
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
    statusCode: 429,
  },
  skip: () => env.NODE_ENV === 'test',
});

// ─── Compression & Parsers ────────────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: `${env.MAX_FILE_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${env.MAX_FILE_SIZE_MB}mb` }));

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms [:req[x-request-id]]',
    {
      stream: { write: (msg: string) => logger.http(msg.trimEnd()) },
      skip: () => env.NODE_ENV === 'test',
    },
  ),
);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Mini SaaS API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

// Raw OpenAPI spec endpoint — useful for client codegen tools
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── API Routes ───────────────────────────────────────────────────────────────

// Rate limiting applied to all /api routes
app.use('/api', globalLimiter);

// Health check — GET /api/health
app.use('/api/health', healthRouter);

// Versioned routes — registered per task:
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/workspaces', workspaceRoute);
app.use('/api/v1/boards', boardRoute);
app.use('/api/v1/lists', listRoute);
app.use('/api/v1/tasks', taskRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/attachments', attachmentRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/notifications', notificationRoute);

// Serve static uploads
app.use('/uploads', express.static(env.UPLOAD_DIR));
// app.use('/api/v1/documents', documentRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Must be AFTER all routes
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────────────────────────────
// Must be LAST — 4 params signature is required by Express
app.use(errorHandler);
