import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import Post from '../models/Posts.js';
import Comment from '../models/Comment.js';

const checkCommentOwnership = async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findById({ _id: commentId }).populate('postId');
  if (!comment) {
    throw HttpError(404, 'Comment not found');
  }
  const post = await Post.findById(comment.postId);

  if (!post) {
    throw HttpError(404, 'Post not found');
  }

  if (
    comment.owner.toString() !== req.user.id &&
    post.owner.toString() !== req.user.id
  ) {
    throw HttpError(403, 'You are no allowed to delete this comment');
  }
  next();
};

export default ctrlWrapper(checkCommentOwnership);
