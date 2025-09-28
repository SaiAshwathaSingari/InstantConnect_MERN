import { text } from "stream/consumers";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";


export const userSideMessages = async(req,res)=>{
  try {
    const {user} = req.body;
    const userId = user._id;
    const unseenMessages = {};
    const userExceptSelf = await User.find({_id:{$ne:userId}}).select("-password");
    const promises = userExceptSelf.map(async(user)=>{
        const messages = await Message.find({senderId:user._id,receiverId:userId,seen:false});
        if(messages.length>0){
          unseenMessages[user._id] = messages.length;
        }
    })    
    await Promise.all(promises);
    res.status(200).json({success:true, users:userExceptSelf, unseenMessages});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

// get all messages for selected user 

export const getAllMessages = async(req,res)=>{
  try {
    const {id: selectedUserId} = req.params;
    const userId = req.body.user._id;
    const messages = await Message.find({
      $or:[
        {senderId:userId, receiverId:selectedUserId},
        {senderId:selectedUserId, receiverId:userId} 
      ]

    })
    await Message.updateMany({senderId:selectedUserId, receiverId:userId, seen:false},{$set:{seen:true}});
    res.status(200).json({success:true, messages});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

// mark message as read

export const markMessagesAsRead = async(req,res)=>{
  try {
    const {id} = req.params;
    await Message.findByIdAndUpdate(id,{$set:{seen:true}});
    res.status(200).json({success:true, msg:"Message marked as read"});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

// function to send a message to a user
const  sendMessage = async(req,res)=>{
    
    try {
      const {Message,image} = req.body;
    const myId = req.user._id;
    const {id:receiverId} = req.params;  
    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      myId,
      receiverId,
      text,
      imageUrl,
      

    })
    res.status(200).json({success:true, newMessage});
    } catch (error) {
      console.log(error);
      res.status(500).json({success:false, msg:"Server Error"});
    }
}