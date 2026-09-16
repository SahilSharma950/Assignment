import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Protect all chat routes
router.use(requireAuth);

router.get('/workspace/:workspaceId', chatController.getWorkspaceMessages);

export default router;
