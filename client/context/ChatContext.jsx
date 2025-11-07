import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);

  // Get list of users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/message/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return;
      }
      
      const { data } = await axios.get(`/api/message/${userId}`);
      
      if (data.success && Array.isArray(data.messages)) {
        // Process messages to ensure they have both text and content fields
        const processedMessages = data.messages.map(msg => ({
          ...msg,
          text: msg.text || msg.content || "",
          content: msg.content || msg.text || ""
        }));
        setMessages(processedMessages);
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

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/message/mark/${selectedUser._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  // Unsubscribe from socket
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, socket]);

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
        // Ensure message has all required fields
        const newMessage = {
          ...data.newMessage,
          text: content || "",
          content: content || "",
          image: data.newMessage.image || null,
          senderId: data.newMessage.senderId || authUser._id
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      } else {
        toast.error(data.msg || "Failed to send message");
        throw new Error(data.msg || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.msg || error.message || "Failed to send message");
      throw error;
    }
  };

  const value = {
    messages,
    setMessages,
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages,      // Corrected
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
