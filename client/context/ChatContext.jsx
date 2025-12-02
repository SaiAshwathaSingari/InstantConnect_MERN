import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);         // ALL users (for AddFriendsPage)
  const [friends, setFriends] = useState([]);     // ONLY friends (for Sidebar)
  const [pendingRequests, setPendingRequests] = useState([]); // requests RECEIVED by me
  const [sentRequests, setSentRequests] = useState([]); // requests I SENT
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [latestMessages, setLatestMessages] = useState({}); // Track latest message for each user
  const [lastMessageTimes, setLastMessageTimes] = useState({}); // Track timestamps

  const { socket, axios, authUser, refreshAuthUser } = useContext(AuthContext);

  /* ----------------------------- USERS / FRIENDS ----------------------------- */

  // Get list of all users (for AddFriendsPage)
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/message/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("getUsers error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch users");
    }
  };

  // Get friends list (only friends) - Sidebar will use this
  const getFriends = async () => {
    try {
      const { data } = await axios.get("/api/user/friends");
      if (data.success) {
        setFriends(data.friends || []);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("getFriends error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch friends");
    }
  };

  /* -------------------------- FRIEND REQUESTS API --------------------------- */

  // Received (pending for me)
  const getReceivedRequests = async () => {
    try {
      const { data } = await axios.get("/api/friend-requests/received");
      setPendingRequests(Array.isArray(data) ? data : (data.requests || []));
    } catch (error) {
      console.error("getReceivedRequests error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch incoming requests");
    }
  };

  // Sent requests
  const getSentRequests = async () => {
    try {
      const { data } = await axios.get("/api/friend-requests/sent");
      setSentRequests(Array.isArray(data) ? data : (data.requests || []));
    } catch (error) {
      console.error("getSentRequests error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch sent requests");
    }
  };

  // Send friend request (to userId)
  const sendFriendRequest = async (toUserId) => {
    try {
      // optimistic UI: mark as sent locally
      setSentRequests(prev => {
        if (prev.find(r => String(r.to?._id || r.to) === String(toUserId))) return prev;
        return [{ to: toUserId, _id: `tmp-${toUserId}`, createdAt: new Date().toISOString() }, ...prev];
      });

      const { data } = await axios.post("/api/friend-requests/send", { to: toUserId });

      // refresh sent list (server is source of truth)
      await getSentRequests();

      // notify target via socket if available
      if (socket && data?.request) {
        socket.emit("friendRequestCreated", data.request);
      }

      toast.success(data.message || "Request sent");
      return data.request;
    } catch (error) {
      console.error("sendFriendRequest error:", error);
      // rollback optimistic
      setSentRequests(prev => prev.filter(r => !(String(r.to?._id || r.to) === String(toUserId) && String(r._id || "").startsWith("tmp-"))));
      toast.error(error.response?.data?.message || error.message || "Failed to send request");
      throw error;
    }
  };

  // Accept friend request (requestId)
  const acceptFriendRequest = async (requestId) => {
    try {
      const { data } = await axios.post("/api/friend-requests/accept", { requestId });
      toast.success(data.message || "Request accepted");

      // remove from pendingRequests and refresh friends
      setPendingRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));
      await getFriends();

      // refresh authUser profile (so friends list in authUser is in sync)
      if (typeof refreshAuthUser === "function") {
        refreshAuthUser().catch(() => { });
      }

      // emit socket event if socket available
      if (socket && data.request) {
        socket.emit("friendRequestAccepted", data.request);
      }

      return data;
    } catch (error) {
      console.error("acceptFriendRequest error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to accept request");
      throw error;
    }
  };

  // Delete/cancel/reject request (requestId)
  const deleteFriendRequest = async (requestId) => {
    try {
      const { data } = await axios.delete("/api/friend-requests/delete", { data: { requestId } });
      toast.success(data.message || "Request removed");

      // update local lists
      setPendingRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));
      setSentRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));

      // refresh friends if needed
      await getFriends().catch(() => { });

      // emit socket notify
      if (socket) {
        socket.emit("friendRequestDeleted", { requestId });
      }

      return data;
    } catch (error) {
      console.error("deleteFriendRequest error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete request");
      throw error;
    }
  };

  /* ------------------------------- MESSAGES -------------------------------- */

  // Get messages for selected user - Optimized for speed
  const getMessages = async (userId) => {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return;
      }

      // Clear unseen count immediately for instant UI feedback
      setUnseenMessages(prev => ({
        ...prev,
        [userId]: 0
      }));

      // Start both requests in parallel
      const messagesPromise = axios.get(`/api/message/${userId}`);
      const markSeenPromise = axios.put(`/api/message/mark/${userId}`).catch(console.error);

      const { data } = await messagesPromise;

      if (data.success && Array.isArray(data.messages)) {
        // Process messages quickly
        const processedMessages = data.messages.map(msg => ({
          ...msg,
          text: msg.text || msg.content || "",
          content: msg.content || msg.text || ""
        }));

        // Set messages immediately
        setMessages(processedMessages);

        // Update latest message data in background
        if (processedMessages.length > 0) {
          const latestMsg = processedMessages[processedMessages.length - 1];
          setLatestMessages(prev => ({
            ...prev,
            [userId]: {
              text: latestMsg.text || latestMsg.content || "",
              image: latestMsg.image,
              audio: latestMsg.audio,
              senderId: latestMsg.senderId,
              timestamp: latestMsg.createdAt || new Date().toISOString(),
              isFromMe: latestMsg.senderId === authUser?._id
            }
          }));

          setLastMessageTimes(prev => ({
            ...prev,
            [userId]: new Date(latestMsg.createdAt || new Date()).getTime()
          }));
        }

        return processedMessages;
      } else {
        console.error('Invalid messages data:', data);
        setMessages([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      return [];
    }
  };

  // Subscribe to new messages via socket
  const subscribeToMessages = () => {
    if (!socket) return;

    // Remove existing listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("messagesSeen");

    socket.on("newMessage", (newMessage) => {
      // Process the message quickly
      const processedMessage = {
        ...newMessage,
        text: newMessage.text || newMessage.content || "",
        content: newMessage.content || newMessage.text || ""
      };

      // Determine the other user (not the current user)
      const otherUserId = processedMessage.senderId === authUser?._id
        ? processedMessage.receiverId
        : processedMessage.senderId;

      // Update latest message for the conversation
      setLatestMessages(prev => ({
        ...prev,
        [otherUserId]: {
          text: processedMessage.text || processedMessage.content || "",
          image: processedMessage.image,
          audio: processedMessage.audio,
          senderId: processedMessage.senderId,
          timestamp: processedMessage.createdAt || new Date().toISOString(),
          isFromMe: processedMessage.senderId === authUser?._id
        }
      }));

      // Update last message time for sorting
      setLastMessageTimes(prev => ({
        ...prev,
        [otherUserId]: new Date(processedMessage.createdAt || new Date()).getTime()
      }));

      // Show messages from selected user OR messages you sent to selected user
      if (selectedUser && (processedMessage.senderId === selectedUser._id || processedMessage.receiverId === selectedUser._id)) {
        // Add message immediately - socket ensures no duplicates
        setMessages((prev) => [...prev, processedMessage]);

        // Mark message as seen if it's from the selected user
        if (processedMessage.senderId === selectedUser._id) {
          // Mark messages as seen on server
          axios.put(`/api/message/mark/${selectedUser._id}`)
            .then(response => {
              console.log(`Marked ${response.data.markedCount || 1} messages as seen`);
            })
            .catch(console.error);

          // Update unseen messages count immediately
          setUnseenMessages(prev => ({
            ...prev,
            [selectedUser._id]: 0
          }));
        }
      } else {
        // Update unseen messages count for other users
        setUnseenMessages((prev) => ({
          ...prev,
          [processedMessage.senderId]: (prev[processedMessage.senderId] || 0) + 1,
        }));
      }
    });

    // Listen for messages seen events
    socket.on("messagesSeen", (data) => {
      const { readerId, count } = data;
      console.log(`${count} messages were seen by user ${readerId}`);

      // Update message seen status in the current chat if viewing that user
      if (selectedUser && selectedUser._id === readerId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.senderId === authUser._id && !msg.seen
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    });
  };

  // Unsubscribe from socket
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesSeen");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, socket, authUser]);

  // Send message to selected user
  const sendMessage = async ({ content, image }) => {
    if (!selectedUser) {
      toast.error("No user selected!");
      return;
    }

    if (!content && !image) {
      toast.error("Message content or image is required!");
      return;
    }

    try {
      // Prepare message data
      const messageData = {
        text: content || "",
        content: content || "",
      };

      // Add image if present
      if (image) {
        messageData.image = image;
      }

      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        messageData
      );

      if (data.success && data.newMessage) {
        const newMsg = {
          ...data.newMessage,
          text: content || "",
          content: content || "",
          image: data.newMessage.image || null,
          senderId: data.newMessage.senderId
        };

        // Add to messages if not already present (socket might have added it)
        setMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Update latest message
        setLatestMessages(prev => ({
          ...prev,
          [selectedUser._id]: {
            text: newMsg.text,
            image: newMsg.image,
            audio: newMsg.audio,
            senderId: newMsg.senderId,
            timestamp: newMsg.createdAt,
            isFromMe: true
          }
        }));

        // Update last message time
        setLastMessageTimes(prev => ({
          ...prev,
          [selectedUser._id]: new Date(newMsg.createdAt).getTime()
        }));

        return newMsg;
      } else {
        throw new Error(data.msg || "Failed to send message");
      }

    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.msg || error.message || "Failed to send message");
      throw error;
    }
  };

  /* -------------- socket listeners for friend requests (real-time) -------------- */
  useEffect(() => {
    if (!socket) return;

    // cleanup previous
    socket.off("friendRequestCreated");
    socket.off("friendRequestAccepted");
    socket.off("friendRequestDeleted");
    socket.off("onlineFriendUpdate");

    // someone sent me a request
    socket.on("friendRequestCreated", (request) => {
      // if the request is for me, add to pendingRequests
      if (String(request.to) === String(authUser?._id)) {
        setPendingRequests(prev => [request, ...prev]);
        toast.success("New friend request received");
      }

      // optionally if I sent, update sentRequests
      if (String(request.from) === String(authUser?._id)) {
        setSentRequests(prev => [request, ...prev]);
      }
    });

    // request accepted
    socket.on("friendRequestAccepted", (request) => {
      // remove from pending/sent and refresh friends
      setPendingRequests(prev => prev.filter(r => String(r._id) !== String(request._id)));
      setSentRequests(prev => prev.filter(r => String(r._id) !== String(request._id)));
      getFriends().catch(() => { });
      toast.success("A friend request was accepted");
    });

    // request deleted/cancelled
    socket.on("friendRequestDeleted", ({ requestId }) => {
      setPendingRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));
      setSentRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));
    });

    // server can notify friend list changes
    socket.on("onlineFriendUpdate", (friendsIds) => {
      // consumer can use onlineUsers in AuthContext and friends state here
      // no direct change required here unless you want to map friend online flags
      console.log("onlineFriendUpdate", friendsIds);
    });

    return () => {
      socket.off("friendRequestCreated");
      socket.off("friendRequestAccepted");
      socket.off("friendRequestDeleted");
      socket.off("onlineFriendUpdate");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, authUser]);

  /* ------------------------------- INITIAL LOAD ------------------------------- */
  useEffect(() => {
    // load users & friends & requests
    getUsers();
    getFriends();
    getReceivedRequests();
    getSentRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------- CONTEXT VALUE ------------------------------- */
  const value = {
    messages,
    setMessages,
    users,              // ALL users (AddFriendsPage)
    setUsers,
    friends,            // ONLY friends (Sidebar should use this)
    setFriends,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    latestMessages,
    setLatestMessages,
    lastMessageTimes,
    setLastMessageTimes,
    getUsers,
    getFriends,
    getMessages,
    sendMessage,
    // friend request functions
    getReceivedRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriendRequest,
    // pending lists
    pendingRequests,
    setPendingRequests,
    sentRequests,
    setSentRequests,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
