import express from "express";
import {
  sendFriendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptFriendRequest,
  deleteFriendRequest,
} from "../controllers/friendRequests.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

/* ------------------------- SEND FRIEND REQUEST ------------------------- */
router.post("/send", protectRoute, sendFriendRequest);

/* ---------------------- GET PENDING RECEIVED REQUESTS ------------------ */
router.get("/received", protectRoute, getReceivedRequests);

/* ------------------------- GET PENDING SENT REQUESTS ------------------- */
router.get("/sent", protectRoute, getSentRequests);

/* --------------------------- ACCEPT REQUEST ---------------------------- */
router.post("/accept", protectRoute, acceptFriendRequest);

/* --------------------- CANCEL / REJECT / DELETE REQUEST ---------------- */
router.delete("/delete", protectRoute, deleteFriendRequest);

export default router;
