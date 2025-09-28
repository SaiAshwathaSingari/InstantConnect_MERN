import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = async(req,res,next)=>{
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
      return res.status(401).json({success:false, msg:"Not authorized, user not found"});
    }
    req.User = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({msg:"Not authorized, token failed"});
  }
}