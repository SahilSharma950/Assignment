import { Router } from 'express';
import { getConversations, getConversation } from '../controllers/directMessage.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const directMessageRoute = Router();

directMessageRoute.use(requireAuth);

/**
 * @swagger
 * /api/v1/dm/conversations:
 *   get:
 *     tags:
 *       - Direct Messages
 *     summary: List the current user's direct-message conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations, newest first
 */
directMessageRoute.get('/conversations', getConversations);

/**
 * @swagger
 * /api/v1/dm/{userId}:
 *   get:
 *     tags:
 *       - Direct Messages
 *     summary: Get the message history with a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message history, oldest first
 *       404:
 *         description: User not found
 */
directMessageRoute.get('/:userId', getConversation);
