import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

// Function for Signup
export const Signup = async (req, res) => {
  try {
    const { email, fullname, password, bio } = req.body;

    if (!email || !fullname || !password || !bio) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    // ❌ was: new User.findOne(...)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ❌ was: new User.create(...)
    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token: token,
      userData: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function for Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    const exisitingUser = await User.findOne({ email });
    if (!exisitingUser) {
      return res
        .status(400)
        .json({ msg: "User does not exist! Please Signup" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      exisitingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(exisitingUser._id);

    res.status(200).json({
      success: true,
      token: token,
      userData: exisitingUser,
      message: "Login Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to check for authenticated user
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.User });
};

// Function to update profile picture
export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic, fullname, bio } = req.body;
    const userId = req.User._id;
    let updatedUser;

    // If no new profile picture, just update name & bio
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullname, bio },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully (no new photo)",
      });
    }

    // Upload the new profile picture to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "user_profiles",
      resource_type: "image",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    // Update the user with new Cloudinary URL
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url, fullname, bio },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully with new photo",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

