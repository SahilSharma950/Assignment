import { Router } from 'express';
import { list } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const userRoute = Router();

userRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all other users (for people-pickers like workspace invites)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
userRoute.get('/', list);
