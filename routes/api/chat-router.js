import express from 'express';
import chatController from '../../controllers/chat-controller.js';
import { authenticate } from '../../middlewares/index.js';

const chatRouter = express.Router();

chatRouter.get('/chats/:userId', authenticate, chatController.getChatsById);
chatRouter.get('/chat/:id', authenticate, chatController.getChatById);
chatRouter.delete('/chat/:id', authenticate, chatController.removeChat);
chatRouter.delete('/chats/:userId', authenticate, chatController.removeChats);

chatRouter.get('/shared-chat/:id', authenticate, chatController.getSharedChat);
chatRouter.post('/share-chat/:id', authenticate, chatController.shareChat);
chatRouter.post('/save-chat', authenticate, chatController.saveChat);

export default chatRouter;
