import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from "../assets/assets";
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

function SideBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, onlineUsers } = useContext(AuthContext);

  // ⚠️ changed this: replaced `users` with `friends`
  const { 
    friends,
    getFriends,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    latestMessages,
    lastMessageTimes
  } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // filtering friends only
  const filteredUsers = (friends || [])
    .filter(user => user && user.fullname)
    .filter(user => user.fullname.toLowerCase().includes(input.toLowerCase()))
    .sort((a, b) => {
      const aLastMessage = lastMessageTimes[a._id] || 0;
      const bLastMessage = lastMessageTimes[b._id] || 0;

      if (aLastMessage && bLastMessage) return bLastMessage - aLastMessage;
      if (aLastMessage && !bLastMessage) return -1;
      if (!aLastMessage && bLastMessage) return 1;

      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;

      return a.fullname.localeCompare(b.fullname);
    });

  // load friends list
  useEffect(() => {
    getFriends();
  }, [onlineUsers]);

  return (
    <div className="h-screen w-80 glass text-stone-100 flex flex-col p-6 relative overflow-hidden
      border-r border-white/10 group/sidebar animate-fadeInLeft">

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-orange-400/30 rounded-full animate-float"></div>
        <div className="absolute top-32 right-8 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-6 w-1 h-1 bg-orange-300/50 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-12 w-2.5 h-2.5 bg-amber-500/20 rounded-full animate-float-delayed"></div>
      </div>

      {/* Dynamic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 
        animate-gradient pointer-events-none"></div>

      {/* Brand Title */}
      <div className="mb-8 mx-auto text-center relative z-10 animate-fadeInUp">
        <div className="relative inline-block group/title magnetic">
          <span className="text-4xl font-black text-glow bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500
            bg-clip-text text-transparent tracking-tight select-none cursor-default animate-gradient">
            Instant
          </span>
          <div className="text-2xl font-light text-orange-200/80 tracking-[0.2em] mt-1 select-none cursor-default">
            CONNECT
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur-2xl
            opacity-0 group-hover/title:opacity-100 transition-all duration-700 -z-10 animate-pulse-glow"></div>
        </div>
      </div>

      {/* Menu */}
      <div className="absolute top-6 right-6 z-20 animate-fadeInUp animate-stagger-1">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-2 rounded-xl glass glow-effect magnetic ripple transition-all duration-300
              hover:scale-110 active:scale-95 group/menu"
          >
            <div className={`w-6 h-6 flex flex-col justify-center items-center transition-all duration-300 ${menuOpen ? 'rotate-45' : ''}`}>
              <div className={`w-5 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-90 translate-y-0' : '-translate-y-1'}`}></div>
              <div className={`w-5 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
              <div className={`w-5 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-90 -translate-y-0' : 'translate-y-1'}`}></div>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-48 glass rounded-2xl border border-white/20 
              shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] z-50 animate-fadeInUp overflow-hidden">

              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 cursor-pointer 
                  transition-all duration-200 flex items-center gap-3 group/item magnetic"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full 
                  group-hover/item:scale-125 transition-transform duration-200"></div>
                Edit Profile
              </button>

              <div className="h-px bg-white/10"></div>

              <button
                onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 cursor-pointer 
                  transition-all duration-200 flex items-center gap-3 group/item magnetic text-red-300"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-500 rounded-full 
                  group-hover/item:scale-125 transition-transform duration-200"></div>
                Log out
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className={`flex items-center glass rounded-2xl px-4 py-3 gap-3 mb-6 relative z-10 
        transition-all duration-300 animate-fadeInUp animate-stagger-2 glow-effect
        ${isSearchFocused ? 'ring-2 ring-orange-400/50 shadow-[0_0_30px_rgba(251,146,60,0.3)]' : ''}`}>
        <div className={`transition-all duration-300 ${isSearchFocused ? 'text-orange-400 scale-110' : 'text-stone-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search conversations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-stone-400 
            focus:placeholder:text-stone-500 transition-all duration-200"
        />
        {input && (
          <button
            onClick={() => setInput('')}
            className="text-stone-400 hover:text-orange-400 transition-colors duration-200 magnetic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ADD FRIENDS SECTION */}
      <div
        onClick={() => navigate("/add-friends")}
        className="glass rounded-2xl p-4 mb-4 flex items-center gap-3 cursor-pointer
        border border-white/10 hover:border-orange-400/30 hover:bg-orange-500/10
        transition-all duration-300 group/add shadow-md animate-fadeInUp animate-stagger-2"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/30 to-amber-500/20 
            blur-xl opacity-0 group-hover/add:opacity-100 transition-all duration-500"></div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 
            flex items-center justify-center text-stone-900 font-bold text-xl shadow-xl 
            group-hover/add:scale-110 transition-all duration-300 relative z-10">
            +
          </div>
        </div>

        <div className="flex flex-col">
          <p className="font-semibold text-stone-100 text-sm group-hover/add:text-orange-300 transition-all">
            Add New Friends
          </p>
          <p className="text-xs text-stone-400 group-hover/add:text-stone-300 transition-all">
            Search users & send requests
          </p>
        </div>
      </div>

      {/* FRIENDS LIST */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 
              group/user relative overflow-hidden professional-card smooth-scale enhanced-glow
              ${selectedUser?._id === user._id 
                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-400/50 shadow-[0_0_20px_rgba(251,146,60,0.3)]' 
                : 'hover:bg-white/8 border-2 border-transparent hover:border-orange-400/20'
              }
              ${latestMessages[user._id] 
                ? 'border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.15)]' 
                : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >

            <div className="relative">
              <div className="relative group/avatar">
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  onlineUsers.includes(user._id) 
                    ? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 animate-pulse-glow' 
                    : ''
                }`}></div>

                <img
                  src={user.profilePic || assets.avatar_icon}
                  alt={user.fullname}
                  className="h-12 w-12 rounded-full border-2 border-white/20 object-cover relative z-10
                    group-hover/user:border-orange-400/50 transition-all duration-300
                    group-hover/avatar:scale-110 shadow-lg"
                />

                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900
                  transition-all duration-300 ${
                    onlineUsers.includes(user._id)
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse-glow'
                      : 'bg-stone-500'
                  }`}>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  )}
                </div>

              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-stone-100 group-hover/user:text-orange-200 transition-colors duration-200">
                    {user.fullname}
                  </p>
                </div>

                {latestMessages[user._id] && (
                  <span className="text-xs text-stone-500 flex-shrink-0">
                    {formatMessageTime(latestMessages[user._id].timestamp)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {latestMessages[user._id] ? (
                  <>
                    {latestMessages[user._id].isFromMe && (
                      <span className="text-xs text-stone-500 flex-shrink-0">You: </span>
                    )}
                    <p className="text-xs text-stone-400 truncate group-hover/user:text-stone-300 transition-colors duration-200">
                      {latestMessages[user._id].audio ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="text-green-400">Voice message</span>
                        </span>
                      ) : latestMessages[user._id].image ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-blue-400">Photo</span>
                        </span>
                      ) : (
                        latestMessages[user._id].text || 'Message'
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-stone-400 truncate group-hover/user:text-stone-300 transition-colors duration-200">
                    {user.bio || 'Hey there! I am using InstantConnect'}
                  </p>
                )}
              </div>
            </div>

            {unseenMessages[user._id] > 0 && (
              <div className="relative">
                <span className="min-w-[24px] h-6 flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 
                  text-white text-xs font-bold rounded-full px-2 shadow-lg animate-pulse-glow">
                  {unseenMessages[user._id] > 99 ? '99+' : unseenMessages[user._id]}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-ping opacity-75"></div>
              </div>
            )}

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 
              opacity-0 group-hover/user:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          </div>
        ))}

        {filteredUsers.length === 0 && input && (
          <div className="text-center py-8 text-stone-400 animate-fadeInUp">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm">No friends found</p>
            <p className="text-xs text-stone-500 mt-1">Try a different search term</p>
          </div>
        )}

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-950/80 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default SideBar;
