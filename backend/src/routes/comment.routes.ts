import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Protect all comment routes
router.use(requireAuth);

/**
 * @swagger
 * /v1/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment
 *     description: Adds a new comment to a specific task.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - content
 *             properties:
 *               taskId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', commentController.createComment);
/**
 * @swagger
 * /v1/comments/task/{taskId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments for a task
 *     description: Retrieves all comments associated with a specific task.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/task/:taskId', commentController.getCommentsByTask);

/**
 * @swagger
 * /v1/comments/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     description: Edits an existing comment by ID.
 *     security:
 *       - BearerAuth: []
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Removes a comment by ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.route('/:id')
  .put(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
