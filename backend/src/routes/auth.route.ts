import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRoute = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
authRoute.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRoute.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logged out
 */
authRoute.post('/logout', requireAuth, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token using HTTP-only cookie
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
authRoute.post('/refresh', refresh);
