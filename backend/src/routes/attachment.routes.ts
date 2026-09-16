import { Router } from 'express';
import { attachmentController } from '../controllers/attachment.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all attachment routes
router.use(requireAuth);

/**
 * @swagger
 * /v1/attachments:
 *   post:
 *     tags:
 *       - Attachments
 *     summary: Upload a new attachment
 *     description: Uploads a file and attaches it to a specific task. Requires multipart/form-data.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               taskId:
 *                 type: string
 *                 description: ID of the task to attach the file to
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', uploadMiddleware.single('file'), attachmentController.uploadAttachment);
/**
 * @swagger
 * /v1/attachments/task/{taskId}:
 *   get:
 *     tags:
 *       - Attachments
 *     summary: Get attachments for a task
 *     description: Retrieves all file attachments associated with a specific task.
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
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/task/:taskId', attachmentController.getAttachmentsByTask);
/**
 * @swagger
 * /v1/attachments/{id}:
 *   delete:
 *     tags:
 *       - Attachments
 *     summary: Delete an attachment
 *     description: Deletes an attachment by ID. You must be the uploader to delete it.
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
 *         description: Attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
