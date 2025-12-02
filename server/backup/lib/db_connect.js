import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB Connection error:", error);
    throw error; // Propagate the error to handle it in server initialization
  }
};

export { connectDB };
