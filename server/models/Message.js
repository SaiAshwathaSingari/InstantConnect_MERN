import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  senderId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
  receiverId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
  text: {type:String},
  image: {type:String},
  audio: {type:String},
  file: {type:String},
  fileName: {type:String},
  fileType: {type:String},
  seen: {type:Boolean,default:false}
},{timestamps:true});

export const Message = mongoose.model("Message", messageSchema);