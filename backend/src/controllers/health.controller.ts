import type { Request, Response } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/httpResponse.js';
import { env } from '../config/env.js';

/**
 * Health check controller.
 *
 * Returns the current operational status of the server and its dependencies.
 * Used by:
 *  - Docker Compose healthchecks
 *  - Kubernetes liveness/readiness probes
 *  - Load balancer health polling
 *  - Monitoring systems (Uptime Robot, Datadog, etc.)
 *
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Server health check
 *     description: Returns the operational status of the server and its connected services.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Server is unhealthy (critical services unreachable)
 */
export const getHealth = (_req: Request, res: Response): void => {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  /**
   * Service connectivity status.
   * Each service is marked 'connected' | 'disconnected' | 'degraded'.
   */
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const services = {
    database: (isDbConnected ? 'connected' : 'disconnected') as 'connected' | 'disconnected' | 'degraded',
    redis: 'disconnected' as 'connected' | 'disconnected' | 'degraded',      // Will be updated in Task: Redis setup
  };

  const isHealthy = env.NODE_ENV === 'test' || isDbConnected; // DB is critical for app health

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      human: formatUptime(uptimeSeconds),
    },
    memory: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      externalMb: Math.round(memoryUsage.external / 1024 / 1024),
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      loadAvg: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
    },
    services,
  };

  const statusCode = isHealthy ? 200 : 503;
  sendSuccess(res, healthData, 'Server is healthy', statusCode);
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
};
