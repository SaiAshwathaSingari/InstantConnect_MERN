import express from 'express';
import { checkAuth, Login, Signup, updateProfilePic } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/signup',Signup);
userRouter.post('/login',Login);
userRouter.put('/update-profile',protectRoute,updateProfilePic);
userRouter.get('/check-auth',protectRoute,checkAuth);

export default userRouter;