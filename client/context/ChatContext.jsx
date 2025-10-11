import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({}); // Corrected
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
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages:', data);
        toast.error(data.msg || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(error.response?.data?.msg || error.message || 'Failed to load messages');
      setMessages([]);
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
  const sendMessage = async (message) => {
    if (!selectedUser) {
      toast.error("No user selected!");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        message
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(error.message);
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
