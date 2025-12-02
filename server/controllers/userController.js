import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import FriendRequest from "../models/FriendRequest.js";

import crypto from "crypto";

// Utility: encrypt private key with password (optimized)
function encryptPrivateKey(privateKeyPem, password) {
  const salt = crypto.randomBytes(16);
  // Use faster PBKDF2 instead of scrypt for better performance
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(privateKeyPem, "utf8")),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedPrivateKey: ciphertext.toString("base64"),
    encSalt: salt.toString("base64"),
    encIv: iv.toString("base64"),
    encAuthTag: authTag.toString("base64"),
  };
}

// Utility: decrypt private key with password (optimized)
function decryptPrivateKey(encData, password) {
  try {
    const salt = Buffer.from(encData.encSalt, "base64");
    const iv = Buffer.from(encData.encIv, "base64");
    const authTag = Buffer.from(encData.encAuthTag, "base64");
    const ciphertext = Buffer.from(encData.encryptedPrivateKey, "base64");

    // Use same fast PBKDF2 for decryption
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error("Failed to decrypt private key - invalid password or corrupted data");
  }
}

export const Signup = async (req, res) => {
  try {
    const { email, fullname, password, bio } = req.body;

    // basic validation
    if (!email || !fullname || !password || !bio) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password (optimized for speed)
    const salt = await bcrypt.genSalt(8); // Reduced from 10 to 8 for faster hashing
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate RSA key pair (1024 for faster generation, still secure for chat)
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 1024,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Encrypt private key using user's password
    const encData = encryptPrivateKey(privateKey, password);

    // Create new user in DB with key fields
    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
      bio,
      publicKeyPem: publicKey,
      encryptedPrivateKey: encData.encryptedPrivateKey,
      encSalt: encData.encSalt,
      encIv: encData.encIv,
      encAuthTag: encData.encAuthTag,
    });

    const token = generateToken(newUser._id);

    // Sanitize returned user object — remove encrypted key fields before sending
    const userObj = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete userObj.encryptedPrivateKey;
    delete userObj.encSalt;
    delete userObj.encIv;
    delete userObj.encAuthTag;

    res.status(201).json({
      success: true,
      token: token,
      userData: userObj,
      message: "User created successfully with keys",
    });
  } catch (error) {
    console.error("Signup error:", error);
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
  res.json({ success: true, user: req.user });
};

// Function to update profile picture
export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic, fullname, bio } = req.body;
    const userId = req.user._id;
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

// Function to get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted friend requests where the current user is either sender or receiver
    const friendRequests = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    }).populate("from to", "-password -encryptedPrivateKey -encSalt -encIv -encAuthTag");

    // Extract the friend's user object from each request
    const friends = friendRequests.map((request) => {
      if (request.from._id.toString() === userId.toString()) {
        return request.to;
      } else {
        return request.from;
      }
    });

    res.status(200).json({ success: true, friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
