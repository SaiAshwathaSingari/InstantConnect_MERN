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
    let updatedUser;
    const userId = req.User._id;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullname },
        { new: true }
      );
      res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      });
    } else {
      // ✅ likely should be upload, not update_metadata
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, fullname, bio },
        { new: true }
      );

      res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
