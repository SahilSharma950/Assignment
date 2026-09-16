import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

/**
 * Health check router.
 *
 * Mounted at: /api/health
 *
 * Endpoints:
 *   GET /api/health  → Server & service health status
 *
 * This route is intentionally:
 *  - Unauthenticated (load balancers/k8s probes don't send auth headers)
 *  - Not rate-limited (must always be reachable under high load)
 *  - Excluded from Swagger auth requirements
 */
const healthRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health Check
 *     description: Returns the health status of the server and its dependencies.
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
healthRouter.get('/', getHealth);

export default healthRouter;
