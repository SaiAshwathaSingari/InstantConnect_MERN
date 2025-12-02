import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";

// Simple message encryption/decryption
const MESSAGE_SECRET = process.env.MESSAGE_SECRET || "your-secret-key-for-messages-2024";

function encryptMessage(text) {
  if (!text) return text;
  try {
    const key = crypto.scryptSync(MESSAGE_SECRET, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.log('Encryption error:', error);
    return text; // Return original if encryption fails
  }
}

function decryptMessage(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync(MESSAGE_SECRET, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.log('Decryption error:', error);
    return encryptedText; // Return as-is if decryption fails
  }
}

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

    // First, mark all messages from selected user as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: userId, seen: false },
      { seen: true }
    );

    // Then fetch all messages
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Optional: sort by time

    // Decrypt messages before sending
    const decryptedMessages = messages.map(msg => ({
      ...msg.toObject(),
      text: decryptMessage(msg.text)
    }));

    // Mark all messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ success: true, messages: decryptedMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Mark all messages from a user as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params; // This is the sender's user ID
    const userId = req.user._id; // Current user (receiver)

    // Mark all unseen messages from the sender as seen
    const result = await Message.updateMany(
      { 
        senderId: senderId, 
        receiverId: userId, 
        seen: false 
      },
      { $set: { seen: true } }
    );

    console.log(`Marked ${result.modifiedCount} messages as seen from user ${senderId} to user ${userId}`);
    
    // Emit socket event to notify sender that their messages were seen
    if (result.modifiedCount > 0 && io) {
      const senderSocketId = userSocketMap[senderId];
      
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          readerId: userId,
          count: result.modifiedCount
        });
        console.log(`Notified user ${senderId} that ${result.modifiedCount} messages were seen by ${userId}`);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      msg: "Messages marked as read",
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Send a message to a user
export const sendMessage = async (req, res) => {
  try {
    const { content, text, image, audio } = req.body; // Get message content including audio
    
    // Removed verbose logging for better performance
    
    if (!content && !text && !image && !audio) {
      return res.status(400).json({ success: false, msg: "Message content is required" });
    }
    
    const myId = req.user._id;
    const { id: receiverId } = req.params;

    let imageUrl;
    let audioUrl;
    
    if (image) {
      try {
        // Configure upload options
        const uploadOptions = {
          resource_type: 'auto',
          folder: 'chat_images',
          allowed_formats: ['jpg', 'png', 'gif', 'webp', 'jpeg'],
          max_bytes: 2000000, // 2MB limit
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' }
          ]
        };

        const uploadResponse = await cloudinary.uploader.upload(image, uploadOptions);
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ 
          success: false, 
          msg: "Failed to upload image. Please try again with a smaller image or different format." 
        });
      }
    }

    if (audio) {
      try {
        const uploadOptions = {
          resource_type: 'auto',
          folder: 'chat_audio',
          allowed_formats: ['mp3', 'wav', 'webm', 'ogg'],
          max_bytes: 5000000, // 5MB limit for audio
        };

        const uploadResponse = await cloudinary.uploader.upload(audio, uploadOptions);
        audioUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Audio upload error:', uploadError);
        return res.status(400).json({ 
          success: false, 
          msg: `Failed to upload audio: ${uploadError.message}` 
        });
      }
    }

    const messageContent = text || content; // Use either field

    // Encrypt message before storing in database
    const encryptedText = messageContent ? encryptMessage(messageContent) : messageContent;

    const newMessage = await Message.create({
      senderId: myId,
      receiverId,
      text: encryptedText,
      image: imageUrl,
      audio: audioUrl,
      seen: false,
    });

    // Create message for real-time emission (with decrypted text)
    const messageForEmit = {
      ...newMessage.toObject(),
      text: messageContent, // Send original unencrypted text for real-time
      content: messageContent // Ensure both fields are available
    };

    // Emit message to both sender and receiver for real-time updates
    const receiverSocketId = userSocketMap[receiverId];
    const senderSocketId = userSocketMap[myId];
    
    // Send to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageForEmit);
    }
    
    // Send to sender for real-time update (so they see their own message immediately)
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", messageForEmit);
    }

    res.status(200).json({ success: true, newMessage: messageForEmit });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};
