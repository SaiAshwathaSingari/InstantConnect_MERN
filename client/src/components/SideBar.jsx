import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from "../assets/assets";
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

function SideBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, onlineUsers } = useContext(AuthContext);
  const { users, getUsers, unseenMessages, selectedUser, setSelectedUser } = useContext(ChatContext);
  const [input, setInput] = useState("");

  // Filter users safely and sort by online status
  const filteredUsers = (users || [])
    .filter(user => user && user.fullname)
    .filter(user => user.fullname.toLowerCase().includes(input.toLowerCase()))
    .sort((a, b) => {
      // Sort online users first
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      // Then sort by name
      return a.fullname.localeCompare(b.fullname);
    });

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div className="h-screen w-72 bg-stone-900/80 backdrop-blur-xl text-stone-100 flex flex-col p-6 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] relative">
      {/* Brand Title */}
      <div className="mb-10 mx-auto text-center">
        <span className="text-3xl font-bold text-orange-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] tracking-wide select-none">Insta</span>
        <span className="text-3xl font-semibold text-orange-300 tracking-wide select-none">Connect</span>
      </div>

      {/* Menu */}
      <div className="absolute top-6 right-6">
        <img
          src={assets.menu_icon}
          alt="menu_icon"
          className="h-7 w-7 cursor-pointer hover:rotate-90 transition-transform duration-300"
          onClick={() => setMenuOpen(prev => !prev)}
        />
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-stone-800/80 border border-stone-700 shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)] z-50">
            <button
              onClick={() => { navigate('/profile'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-stone-700/70 cursor-pointer rounded-t-2xl transition-colors"
            >
              Edit Profile
            </button>
            <hr className="border-stone-700" />
            <button
              onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-stone-700/70 cursor-pointer rounded-b-2xl transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center bg-stone-800/80 rounded-2xl px-3 py-2 gap-2 mb-6 shadow-inner">
        <img src={assets.search_icon} alt="search" className="h-5 w-5 opacity-70" />
        <input
          type="text"
          placeholder="Search User..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-stone-400"
        />
      </div>

      {/* Users List */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {filteredUsers.map(user => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center gap-3 p-3 ${selectedUser?._id === user._id ? 'bg-stone-700/70' : 'bg-stone-800/80'} rounded-2xl hover:bg-stone-700/70 cursor-pointer relative transition-colors shadow-[0_4px_12px_-2px_rgba(251,146,60,0.3)]`}
          >
            <div className="relative">
              <img
                src={user.profilePic || assets.avatar_icon}
                alt={user.fullname}
                className="h-10 w-10 rounded-full border-2 border-stone-700 object-cover"
              />
              <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-stone-900 ${
                onlineUsers.includes(user._id) ? 'bg-green-500' : 'bg-stone-500'
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullname}</p>
              <p className="text-xs text-stone-400 truncate">{user.bio || 'No bio set'}</p>
            </div>
            
            {/* Unseen messages count */}
            {unseenMessages[user._id] > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full px-1.5">
                {unseenMessages[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Unseen Messages Badge */}
      {selectedUser && unseenMessages[selectedUser._id] > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-[0_4px_12px_-2px_rgba(251,146,60,0.5)]">
          {unseenMessages[selectedUser._id]} New Messages
        </div>
      )}
    </div>
  );
}

export default SideBar;
