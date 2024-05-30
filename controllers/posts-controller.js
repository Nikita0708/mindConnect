import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import Post from '../models/Posts.js';
import Comment from '../models/Comment.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const addPost = async (req, res) => {
  const { _id: owner } = req.user;
  const { title, description } = req.body;

  let imageUrl;
  if (req.file) {
    const { path: temporaryName } = req.file;
    const result = await cloudinary.uploader.upload(temporaryName, {
      folder: 'post-images',
    });
    imageUrl = result.secure_url;
  }
  const newPost = await Post.create({
    owner,
    title: title,
    description: description,
    image: imageUrl,
  });

  res.status(200).json({ message: 'Post created successully', newPost });
};

const deletePost = async (req, res) => {
  const { _id: owner } = req.user;
  const { postId } = req.params;
  const post = await Post.findOne({ owner, _id: postId });

  if (!post) {
    throw HttpError(404, 'Post not found');
  }
  post.remove();
  res.status(200).json({ message: 'Post deleted successfully' });
};

const updatePost = async (req, res) => {
  const { _id: owner } = req.user;
  const { postId } = req.params;
  const { title, description, image } = req.body;

  let imageUrl;
  if (req.file) {
    const { path: temporaryName } = req.file;
    const result = await cloudinary.uploader.upload(temporaryName, {
      folder: 'post-images',
    });
    imageUrl = result.secure_url;
  }
  const conditions = { owner, _id: postId };

  const updatedPost = await Post.findOneAndUpdate(
    conditions,
    {
      title,
      description,
      image: imageUrl,
    },
    { new: true } // Return the updated document
  );

  if (!updatedPost) {
    throw HttpError(404, 'Post not found');
  }

  res.status(200).json({ message: 'Post updated successfully' });
};

const addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { _id: owner } = req.user;

  const post = await Post.findById({ _id: postId });
  if (!post) {
    throw HttpError(404, 'Post not found');
  }
  const comment = new Comment({ owner, content, postId });
  await comment.save();

  post.comments.push(comment);
  await post.save();
  res.status(200).json({ message: 'Successfully created comment', comment });
};

const getComments = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId).populate('comments');
  if (!post) {
    throw HttpError(404, 'Post not found');
  }
  res.status(200).json(post.comments);
};
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { _id: owner } = req.user;

  const comment = await Comment.findByIdAndDelete({ owner, _id: commentId });
  if (!comment) {
    throw HttpError(404, 'Comment not found');
  }
  comment.remove();
  res.status(200).json({ message: 'Comment deleted successfully' });
};

export default {
  addPost: ctrlWrapper(addPost),
  deletePost: ctrlWrapper(deletePost),
  updatePost: ctrlWrapper(updatePost),
  addComment: ctrlWrapper(addComment),
  getComments: ctrlWrapper(getComments),
  deleteComment: ctrlWrapper(deleteComment),
};
