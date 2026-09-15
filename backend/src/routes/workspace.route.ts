import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/workspace.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const workspaceRoute = Router();

// All workspace routes require authentication
workspaceRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/workspaces:
 *   post:
 *     tags:
 *       - Workspaces
 *     summary: Create a new workspace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 */
workspaceRoute.post('/', create);

/**
 * @swagger
 * /api/v1/workspaces:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Get all workspaces for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
workspaceRoute.get('/', getAll);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Get a workspace by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
 */
workspaceRoute.get('/:id', getOne);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   put:
 *     tags:
 *       - Workspaces
 *     summary: Update a workspace (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated
 */
workspaceRoute.put('/:id', update);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   delete:
 *     tags:
 *       - Workspaces
 *     summary: Delete a workspace (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace deleted
 */
workspaceRoute.delete('/:id', remove);
