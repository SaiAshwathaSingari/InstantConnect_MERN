import FriendRequest from "../models/FriendRequest.js";
import {User} from "../models/User.js";

/* -------------------------------------------------------------
   SEND FRIEND REQUEST
------------------------------------------------------------- */
export const sendFriendRequest = async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user._id; // user from auth middleware

    if (!to) return res.status(400).json({ message: "Receiver ID missing" });

    if (to === String(from))
      return res.status(400).json({ message: "You cannot send a request to yourself" });

    // Check if already friends
    const sender = await User.findById(from);
    if (sender.friends?.includes(to))
      return res.status(400).json({ message: "Already friends" });

    // Check if pending request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
      status: "pending",
    });

    if (existing)
      return res.status(400).json({ message: "Request already pending" });

    // Create new request
    const request = await FriendRequest.create({ from, to });

    res.status(201).json({ message: "Request sent", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------
   GET PENDING REQUESTS (RECEIVED BY ME)
------------------------------------------------------------- */
export const getReceivedRequests = async (req, res) => {
  try {
    const received = await FriendRequest.find({
      to: req.user._id,
      status: "pending",
    }).populate("from", "fullname profilePic");

    res.json(received);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------
   GET PENDING REQUESTS SENT BY ME
------------------------------------------------------------- */
export const getSentRequests = async (req, res) => {
  try {
    const sent = await FriendRequest.find({
      from: req.user._id,
      status: "pending",
    }).populate("to", "fullname profilePic");

    res.json(sent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------
   ACCEPT REQUEST
------------------------------------------------------------- */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.to) !== String(req.user._id))
      return res.status(401).json({ message: "Not authorized" });

    // update request
    request.status = "accepted";
    await request.save();

    // Add each other to friends list
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: request.to },
    });

    await User.findByIdAndUpdate(request.to, {
      $addToSet: { friends: request.from },
    });

    res.json({ message: "Friend request accepted", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------
   DELETE / REJECT / CANCEL REQUEST
------------------------------------------------------------- */
export const deleteFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (
      String(request.from) !== String(req.user._id) &&
      String(request.to) !== String(req.user._id)
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
