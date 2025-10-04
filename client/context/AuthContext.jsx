import { createContext, useState } from "react";
import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
