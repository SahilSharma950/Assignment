import { Router } from 'express';
import { create, getByBoard, getOne, update, remove } from '../controllers/list.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const listRoute = Router();

// All list routes require authentication
listRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/lists:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Create a new list in a board
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
 *               - boardId
 *             properties:
 *               name:
 *                 type: string
 *               boardId:
 *                 type: string
 *     responses:
 *       201:
 *         description: List created
 */
listRoute.post('/', create);

/**
 * @swagger
 * /api/v1/lists/board/{boardId}:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get all lists for a specific board
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of lists sorted by order
 */
listRoute.get('/board/:boardId', getByBoard);

/**
 * @swagger
 * /api/v1/lists/{id}:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get a list by ID
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
 *         description: List details
 */
listRoute.get('/:id', getOne);

/**
 * @swagger
 * /api/v1/lists/{id}:
 *   put:
 *     tags:
 *       - Lists
 *     summary: Update a list
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
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: List updated
 */
listRoute.put('/:id', update);

/**
 * @swagger
 * /api/v1/lists/{id}:
 *   delete:
 *     tags:
 *       - Lists
 *     summary: Delete a list
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
 *         description: List deleted
 */
listRoute.delete('/:id', remove);
