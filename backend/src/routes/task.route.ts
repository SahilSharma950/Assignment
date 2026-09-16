import { Router } from 'express';
import { create, getByList, getOne, update, remove, assign, unassign } from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const taskRoute = Router();

// All task routes require authentication
taskRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task in a list
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - listId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               listId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
taskRoute.post('/', create);

/**
 * @swagger
 * /api/v1/tasks/list/{listId}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for a specific list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of tasks sorted by order
 */
taskRoute.get('/list/:listId', getByList);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a task by ID
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
 *         description: Task details
 */
taskRoute.get('/:id', getOne);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               listId:
 *                 type: string
 *               order:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated
 */
taskRoute.put('/:id', update);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
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
 *         description: Task deleted
 */
taskRoute.delete('/:id', remove);

/**
 * @swagger
 * /api/v1/tasks/{id}/assignees:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Assign a user to a task
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
 *               - assigneeId
 *             properties:
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User assigned
 */
taskRoute.post('/:id/assignees', assign);

/**
 * @swagger
 * /api/v1/tasks/{id}/assignees/{assigneeId}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Unassign a user from a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: assigneeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unassigned
 */
taskRoute.delete('/:id/assignees/:assigneeId', unassign);
