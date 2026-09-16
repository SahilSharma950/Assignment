import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Protect all comment routes
router.use(requireAuth);

router.post('/', commentController.createComment);
router.get('/task/:taskId', commentController.getCommentsByTask);

router.route('/:id')
  .put(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
