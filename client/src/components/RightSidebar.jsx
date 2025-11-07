import React, { useState, useRef, useEffect, useContext } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

function RightSidebar({ userSelected, isOpen, onClose }) {
  const [width, setWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const startResizeX = useRef(0);
  const startWidth = useRef(0);
  const { onlineUsers } = useContext(AuthContext);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const diff = startResizeX.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidth.current + diff, 320), 600);
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
      className="flex flex-col items-center bg-stone-900/75 backdrop-blur-xl text-stone-100 p-8 rounded-3xl overflow-hidden
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] transition-colors duration-300 ease-out
        motion-safe:hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)] relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-800/50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <img
        src={userSelected.profilePic || assets.avatar_icon}
        alt="profile"
        className="h-28 w-28 rounded-full border-4 border-amber-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] mb-4"
      />

      {onlineUsers.includes(userSelected._id) ? (
        <span className="flex items-center text-green-400 mb-2">
          <span className="h-3 w-3 bg-green-500 rounded-full mr-2 border-2 border-stone-900"></span>
          Online
        </span>
      ) : (
        <span className="flex items-center text-red-400 mb-2">
          <span className="h-3 w-3 bg-stone-500 rounded-full mr-2 border-2 border-stone-900"></span>
          Offline
        </span>
      )}

      <p className="text-2xl font-semibold mb-4 drop-shadow-[0_4px_12px_rgba(251,146,60,0.3)]">{userSelected.fullName}</p>

      <hr className="w-full border-stone-700 mb-4" />

      <div className="w-full space-y-4">
        <div>
          <h3 className="text-stone-400 text-sm mb-1">Email</h3>
          <p className="text-stone-100">{userSelected.email}</p>
        </div>
        <div>
          <h3 className="text-stone-400 text-sm mb-1">Bio</h3>
          <p className="text-stone-100">{userSelected.bio || 'No bio added yet'}</p>
        </div>
        <div>
          <h3 className="text-stone-400 text-sm mb-1">Joined</h3>
          <p className="text-stone-100">
            {new Date(userSelected.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-orange-500/20 group"
        onMouseDown={startResize}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-stone-700/50 
          group-hover:bg-orange-500/50 group-hover:w-1 transition-all duration-200" 
        />
      </div>
    </div>
  );
}

export default RightSidebar;
