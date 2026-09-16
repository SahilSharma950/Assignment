import { Router } from 'express';
import { attachmentController } from '../controllers/attachment.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all attachment routes
router.use(requireAuth);

router.post('/', uploadMiddleware.single('file'), attachmentController.uploadAttachment);
router.get('/task/:taskId', attachmentController.getAttachmentsByTask);
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
