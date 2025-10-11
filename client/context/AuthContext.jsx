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

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendURL, {
      query: { userId: userData._id },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      // Request online users immediately after connecting
      newSocket.emit("getOnlineUsers");
    });

    newSocket.on("getOnlineUsers", (usersIds) => {
      console.log("Online users updated:", usersIds);
      setOnlineUsers(usersIds || []);
    });

    newSocket.on("userConnected", (userId) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    });

    newSocket.on("userDisconnected", (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setOnlineUsers([]);
    });
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
    if (socket) socket.disconnect();
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
  }, [token]);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
