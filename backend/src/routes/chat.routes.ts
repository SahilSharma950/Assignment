import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Protect all chat routes
router.use(requireAuth);

/**
 * @swagger
 * /v1/chat/workspace/{workspaceId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get workspace messages
 *     description: Retrieves paginated chat history for a given workspace.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/workspace/:workspaceId', chatController.getWorkspaceMessages);

export default router;
