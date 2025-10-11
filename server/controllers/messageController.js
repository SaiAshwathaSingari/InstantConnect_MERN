import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../lib/cloudinary.js";

// Get all users except the logged-in user and unseen messages count
export const userSideMessages = async (req, res) => {
  try {
    const userId = req.user._id; // lowercase 'user' from protectRoute
    const unseenMessages = {};

    // Get all users except the current user
    const userExceptSelf = await User.find({ _id: { $ne: userId } }).select("-password");

    // Count unseen messages for each user
    const promises = userExceptSelf.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.status(200).json({ success: true, users: userExceptSelf, unseenMessages });
  } catch (error) {
    console.error('Error in userSideMessages:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }
};

// Get all messages between logged-in user and selected user
export const getAllMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Optional: sort by time

    // Mark all messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Mark a single message as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { $set: { seen: true } });
    res.status(200).json({ success: true, msg: "Message marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Send a message to a user
export const sendMessage = async (req, res) => {
  try {
    const { content, image } = req.body; // Get message content
    if (!content && !image) {
      return res.status(400).json({ success: false, msg: "Message content is required" });
    }
    
    const myId = req.user._id;
    const { id: receiverId } = req.params;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
      seen: false,
    });

    // Emit message to receiver if online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};
