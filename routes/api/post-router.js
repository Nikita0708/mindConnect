import express from 'express';
import postsController from '../../controllers/posts-controller.js';
import {
  isDoctor,
  authenticate,
  upload,
  checkCommentOwnership,
} from '../../middlewares/index.js';

const postsRouter = express.Router();

postsRouter.post(
  '/add-post',
  authenticate,
  isDoctor,
  upload.single('image'),
  postsController.addPost
);
postsRouter.delete(
  '/delete-post/:postId',
  authenticate,
  isDoctor,
  postsController.deletePost
);
postsRouter.patch(
  '/update-post/:postId',
  authenticate,
  isDoctor,
  upload.single('image'),
  postsController.updatePost
);
postsRouter.post(
  '/:postId/add-comment',
  authenticate,
  postsController.addComment
);
postsRouter.get('/:postId/comments', authenticate, postsController.getComments);

postsRouter.delete(
  '/delete-comment/:commentId',
  authenticate,
  checkCommentOwnership,
  postsController.deleteComment
);
postsRouter.patch('/:postId/like', authenticate, postsController.likePost);
postsRouter.patch('/:postId/unlike', authenticate, postsController.unlikePost);

export default postsRouter;
