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

healthRouter.get('/', getHealth);

export default healthRouter;
