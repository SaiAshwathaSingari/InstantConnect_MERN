import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = async(req, res, next) => {
  try {
    let token;
    
    // Check for token in various places
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized, no token provided"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "Not authorized, user not found"
        });
      }
      
      req.user = user;
      next();
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return res.status(401).json({
        success: false,
        msg: "Not authorized, token invalid"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error in authentication"
    });
  }
}