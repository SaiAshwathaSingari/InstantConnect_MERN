import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  profilePic: { type: String, default: "" },
  bio: { type: String },

  // 🔐 --- RSA Key Fields ---
  publicKeyPem: { type: String },         // public key (safe to store)
  encryptedPrivateKey: { type: String },  // base64 encrypted private key
  encSalt: { type: String },              // base64 salt for key derivation
  encIv: { type: String },                // base64 IV for AES-GCM
  encAuthTag: { type: String },           // base64 auth tag for integrity
  // 🔐 ----------------------

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export { User };
