import { ctrlWrapper } from '../decorators/index.js';

import { HttpError } from '../helpers/index.js';

import Chat from '../models/Chat.js';

const getChatsById = async (req, res) => {
  const { userId } = req.params;
  const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
  if (!chats) {
    throw HttpError(404, 'chats not found');
  }
  res.status(200).json(chats);
};

const getChatById = async (req, res) => {
  const { id } = req.params;
  const chat = await Chat.findOne({ id });
  if (!chat) {
    throw HttpError(404, 'chat not found');
  }
  res.status(200).json(chat);
};

const removeChat = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const chat = await Chat.findOneAndDelete({ id, userId });
  if (!chat) {
    throw HttpError(404, 'chat not found');
  }
  res.status(200).json({ message: 'Chat deleted successfully' });
};

const removeChats = async (req, res) => {
  const { userId } = req.params;
  await Chat.deleteMany({ userId });
  res.status(200).json({ message: 'All chats cleared successfully' });
};

const getSharedChat = async (req, res) => {
  const { id } = req.params;
  const chat = await Chat.findOne({ id, sharePath: { $exists: true } });
  if (!chat) {
    throw HttpError(404, 'chat not found');
  }
  res.status(200).json(chat);
};

const shareChat = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const chat = await Chat.findOneAndUpdate(
    { id, userId },
    { $set: { sharePath: `/share/${id}` } },
    { new: true }
  );
  if (!chat) {
    throw HttpError(404, 'chat not found');
  }
  res.status(200).json(chat);
};

const saveChat = async (req, res) => {
  const chat = req.body;
  const newChat = new Chat(chat);
  await newChat.save();
  res.status(200).json(newChat);
};

export default {
  getChatsById: ctrlWrapper(getChatsById),
  getChatById: ctrlWrapper(getChatById),
  removeChat: ctrlWrapper(removeChat),
  removeChats: ctrlWrapper(removeChats),
  getSharedChat: ctrlWrapper(getSharedChat),
  shareChat: ctrlWrapper(shareChat),
  saveChat: ctrlWrapper(saveChat),
};
