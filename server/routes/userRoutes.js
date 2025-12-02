import express from 'express';
import { checkAuth, Login, Signup, updateProfilePic, getFriends } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/signup', Signup);
userRouter.post('/login', Login);
userRouter.put('/update-profile', protectRoute, updateProfilePic);
userRouter.get('/check-auth', protectRoute, checkAuth);
userRouter.get('/friends', protectRoute, getFriends);

export default userRouter;