import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import Post from '../models/Posts.js';

const checkPostOwnership = async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById({ _id: postId });
  if (!post) {
    throw HttpError(404, 'post not found');
  }
  if (post.owner.toString() !== req.user.id) {
    throw HttpError(403, 'You are not allowed to perform this action');
  }
  next();
};

export default ctrlWrapper(checkPostOwnership);
