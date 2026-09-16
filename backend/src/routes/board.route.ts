import { Router } from 'express';
import { create, getByWorkspace, getOne, update, remove } from '../controllers/board.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const boardRoute = Router();

// All board routes require authentication
boardRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/boards:
 *   post:
 *     tags:
 *       - Boards
 *     summary: Create a new board in a workspace
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
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created
 */
boardRoute.post('/', create);

/**
 * @swagger
 * /api/v1/boards/workspace/{workspaceId}:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get all boards for a specific workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of boards in the workspace
 */
boardRoute.get('/workspace/:workspaceId', getByWorkspace);

/**
 * @swagger
 * /api/v1/boards/{id}:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get a board by ID
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
 *         description: Board details
 */
boardRoute.get('/:id', getOne);

/**
 * @swagger
 * /api/v1/boards/{id}:
 *   put:
 *     tags:
 *       - Boards
 *     summary: Update a board
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
 *         description: Board updated
 */
boardRoute.put('/:id', update);

/**
 * @swagger
 * /api/v1/boards/{id}:
 *   delete:
 *     tags:
 *       - Boards
 *     summary: Delete a board
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
 *         description: Board deleted
 */
boardRoute.delete('/:id', remove);
