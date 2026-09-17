import { Router } from 'express';
import { create, getAll, getOne, update, remove, addMember, getMembers, removeMember } from '../controllers/workspace.controller.js';
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

/**
 * @swagger
 * /api/v1/workspaces/{id}/members:
 *   post:
 *     tags:
 *       - Workspaces
 *     summary: Add a member to a workspace by email (Owner only)
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
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added
 *       404:
 *         description: Workspace or user not found
 *       409:
 *         description: User is already a member
 */
workspaceRoute.post('/:id/members', addMember);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Get a workspace's owner and members with user info
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
 *         description: Workspace with populated owner/members
 */
workspaceRoute.get('/:id/members', getMembers);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members/{userId}:
 *   delete:
 *     tags:
 *       - Workspaces
 *     summary: Remove a member from a workspace (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Not the owner, or attempted to remove the owner
 *       404:
 *         description: Workspace not found or user is not a member
 */
workspaceRoute.delete('/:id/members/:userId', removeMember);
