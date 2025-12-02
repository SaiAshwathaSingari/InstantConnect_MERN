import React, { useState, useRef, useEffect } from 'react';
import assets from '../assets/assets';

function RightSidebar({ userSelected, isOpen, onClose }) {
  const [width, setWidth] = useState(384); // 24rem default
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const startResizeX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const diff = startResizeX.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidth.current + diff, 320), 600); // min 320px, max 600px
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResize = (e) => {
    setIsResizing(true);
    startResizeX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'ew-resize';
  };

  if (!userSelected) return null;

  return (
    <div 
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className="flex flex-col items-center glass text-stone-100 p-8 rounded-3xl overflow-hidden
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] transition-all duration-300 ease-out
        hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)] relative animate-fadeInRight
        border border-white/10 glow-effect"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-12 w-2 h-2 bg-orange-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-8 w-1.5 h-1.5 bg-amber-400/25 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 right-6 w-1 h-1 bg-orange-300/30 rounded-full animate-float"></div>
      </div>

      {/* Dynamic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 
        animate-gradient pointer-events-none"></div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-xl glass hover:bg-red-500/20 transition-all duration-300
          magnetic glow-effect border border-white/10 hover:border-red-400/30 z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-300 hover:text-red-300 transition-colors" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8 animate-fadeInUp relative z-10">
        {/* Profile Picture with enhanced effects */}
        <div className="relative mb-6 group/avatar">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/30 to-amber-400/30 animate-pulse-glow"></div>
          <img
            src={userSelected.profilePic || assets.avatar_icon}
            alt="profile"
            className="h-32 w-32 rounded-full border-4 border-white/20 object-cover relative z-10
              shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300
              group-hover/avatar:scale-105 group-hover/avatar:border-orange-400/50"
          />
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-orange-400/50 animate-ping opacity-20"></div>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass border border-white/10 animate-fadeInUp animate-stagger-1">
          <div className="relative">
            <div className="h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-green-400 text-sm font-medium">Online</span>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-center mb-2 text-glow animate-fadeInUp animate-stagger-2
          bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
          {userSelected.fullName}
        </h2>
      </div>

      {/* Elegant divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

      {/* User Info Section */}
      <div className="w-full space-y-6 animate-fadeInUp animate-stagger-3">
        <div className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group/info">
          <h3 className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Email
          </h3>
          <p className="text-stone-200 group-hover/info:text-stone-100 transition-colors duration-200">{userSelected.email}</p>
        </div>
        
        <div className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group/info">
          <h3 className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Bio
          </h3>
          <p className="text-stone-200 group-hover/info:text-stone-100 transition-colors duration-200">
            {userSelected.bio || 'Hey there! I am using InstantConnect'}
          </p>
        </div>
        
        <div className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group/info">
          <h3 className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Member Since
          </h3>
          <p className="text-stone-200 group-hover/info:text-stone-100 transition-colors duration-200">
            {new Date(userSelected.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-orange-500/20 group transition-all duration-200"
        onMouseDown={startResize}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-20 bg-white/10 rounded-r-full
          group-hover:bg-orange-500/50 group-hover:w-2 transition-all duration-300 group-hover:shadow-lg" 
        />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-orange-400/30 rounded-full
          opacity-0 group-hover:opacity-100 transition-all duration-300" 
        />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-950/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default RightSidebar;
