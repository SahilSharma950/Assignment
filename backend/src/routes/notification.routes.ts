import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Protect all notification routes
router.use(requireAuth);

router.get('/', notificationController.getUserNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
