import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { userSideMessages,getAllMessages,markMessagesAsRead,sendMessage } from '../controllers/messageController.js';

const messageRoutes = express.Router();

messageRoutes.get('/users',protectRoute,userSideMessages);
messageRoutes.get('/:id',protectRoute,getAllMessages);
messageRoutes.put('/mark/:id',protectRoute,markMessagesAsRead);
messageRoutes.post('/send/:id',protectRoute,sendMessage);
export default messageRoutes;
