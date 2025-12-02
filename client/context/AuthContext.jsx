import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;

// Configure axios defaults
axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true;

// Configure axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const chekAuth = async () => {
    try {
      console.log("Checking auth at:", `${backendURL}/api/user/check-auth`);
      const { data } = await axios.get("/api/user/check-auth");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      logout(); // clear invalid token
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // refreshAuthUser — re-fetch the current user, useful after accepting friend
  const refreshAuthUser = async () => {
    try {
      const { data } = await axios.get("/api/user/check-auth");
      if (data.success) {
        setAuthUser(data.user);
        // reconnect socket for updated user info
        connectSocket(data.user);
      }
      return data.user;
    } catch (err) {
      console.error("refreshAuthUser error:", err);
      throw err;
    }
  };

  const connectSocket = (userData) => {
    if (!userData) return;

    // Disconnect existing socket if any
    if (socket) {
      if (socket._statusInterval) {
        clearInterval(socket._statusInterval);
      }
      socket.disconnect();
    }

    console.log("🔌 Connecting socket for user:", userData._id);

    const newSocket = io(backendURL, {
      query: { userId: userData._id },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id, "for user:", userData._id);
      // Request online users immediately after connecting
      newSocket.emit("getOnlineUsers");
      // Also emit a manual status update to ensure we're registered
      setTimeout(() => {
        if (newSocket.connected) {
          newSocket.emit("updateOnlineStatus");
        }
      }, 500);
    });

    newSocket.on("getOnlineUsers", (usersIds) => {
      console.log("📊 Online users updated:", usersIds?.length || 0, "users:", usersIds);
      setOnlineUsers(Array.isArray(usersIds) ? usersIds : []);
    });

    newSocket.on("userConnected", (userId) => {
      console.log("🟢 User connected:", userId);
      setOnlineUsers(prev => {
        if (prev.includes(userId)) return prev;
        const updated = [...prev, userId];
        console.log("Updated online users (connect):", updated.length);
        return updated;
      });
    });

    newSocket.on("userDisconnected", (userId) => {
      console.log("🔴 User disconnected:", userId);
      setOnlineUsers(prev => {
        const updated = prev.filter(id => id !== userId);
        console.log("Updated online users (disconnect):", updated.length);
        return updated;
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 1000);
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      newSocket.emit("getOnlineUsers");
    });

    newSocket.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error.message);
    });

    // Periodic online status refresh (every 15 seconds)
    const statusInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("getOnlineUsers");
      } else {
        console.log("⚠️ Socket not connected, attempting to reconnect...");
        newSocket.connect();
      }
    }, 15000);

    // Store interval reference for cleanup
    newSocket._statusInterval = statusInterval;
  };

  const login = async (state, credentials) => {
    try {
      console.log("Login URL:", `${backendURL}/api/user/${state}`);
      const { data } = await axios.post(`/api/user/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
        setToken(data.token);

        axios.defaults.headers.common["token"] = data.token;
        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);

    // Clean up socket and intervals
    if (socket) {
      if (socket._statusInterval) {
        clearInterval(socket._statusInterval);
      }
      socket.disconnect();
    }
    setSocket(null);

    localStorage.removeItem("token");
    delete axios.defaults.headers.common["token"];
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/user/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      chekAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    return () => {
      if (socket) {
        if (socket._statusInterval) {
          clearInterval(socket._statusInterval);
        }
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const value = {
    axios,
    token,
    setToken,
    authUser,
    setAuthUser,
    onlineUsers,
    setOnlineUsers,
    socket,
    setSocket,
    login,
    logout,
    updateProfile,
    refreshAuthUser, // <<-- new
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
