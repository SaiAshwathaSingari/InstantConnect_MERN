import React from 'react';
import ChatSection from '../components/ChatSection';
import RightSidebar from '../components/RightSidebar';
import SideBar from '../components/SideBar';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import assets from '../assets/assets';

function HomePage() {
  const { selectedUser } = React.useContext(ChatContext);
  const { authUser, onlineUsers } = React.useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [showCurrentUserMenu, setShowCurrentUserMenu] = React.useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCurrentUserMenu && !event.target.closest('.current-user-menu')) {
        setShowCurrentUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCurrentUserMenu]);

  // Cursor spotlight
  const onMouseMove = (e) => {
    const root = e.currentTarget;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    root.style.setProperty('--mx', `${x}px`);
    root.style.setProperty('--my', `${y}px`);
  };

  return (
    <div
      onMouseMove={onMouseMove}
      className="h-screen w-screen flex text-stone-100 relative isolate
      bg-stone-950
      bg-[radial-gradient(1200px_700px_at_18%_-10%,rgba(251,146,60,0.10),transparent_55%),radial-gradient(1100px_650px_at_88%_110%,rgba(245,158,11,0.10),transparent_55%),conic-gradient(from_210deg_at_55%_40%,rgba(255,255,255,0.035),transparent_30%)]
      bg-blend-overlay transition-colors duration-300 ease-out"
      style={{
        '--mx': '50vw',
        '--my': '50vh',
      }}
    >
      {/* Cursor-following amber glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(200px 200px at var(--mx) var(--my), rgba(251,146,60,0.18), rgba(245,158,11,0.08) 40%, transparent 65%)',
          transition: 'background-position 120ms ease, opacity 200ms ease',
        }}
      />
      {/* Subtle grain overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" aria-hidden="true"></div>

      {/* Top Header with Current User */}
      <div className="absolute top-0 right-0 z-50 p-4 animate-fadeInUp">
        <div className="relative current-user-menu">
          <button
            onClick={() => setShowCurrentUserMenu(!showCurrentUserMenu)}
            className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border border-white/10 
              hover:border-orange-400/30 transition-all duration-300 group magnetic glow-effect"
          >
            <div className="relative">
              <img
                src={authUser?.profilePic || assets.avatar_icon}
                alt={authUser?.fullname}
                className="h-10 w-10 rounded-full border-2 border-white/20 object-cover
                  group-hover:border-orange-400/50 transition-all duration-300 shadow-lg"
              />
              {/* Online indicator for current user */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-stone-900 
                bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse-glow">
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-100 group-hover:text-orange-200 transition-colors duration-200">
                {authUser?.fullname}
              </p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
            <svg className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${showCurrentUserMenu ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Current User Menu */}
          {showCurrentUserMenu && (
            <div className="absolute right-0 mt-3 w-64 glass rounded-2xl border border-white/20 
              shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] z-50 animate-fadeInUp overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt={authUser?.fullname}
                    className="h-12 w-12 rounded-full border-2 border-white/20 object-cover shadow-lg"
                  />
                  <div>
                    <p className="font-semibold text-stone-100">{authUser?.fullname}</p>
                    <p className="text-xs text-stone-400">{authUser?.email}</p>
                    <p className="text-xs text-stone-400 mt-1">{authUser?.bio || 'No bio set'}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="px-3 py-2 text-sm text-stone-300 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {onlineUsers.length} users online
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar and main content */}
      <SideBar />
      <div className="flex-1 flex overflow-hidden">
        {selectedUser && (
          <>
            <div className={`flex-1 transition-all duration-300 ${isProfileOpen ? 'mr-[384px]' : 'mr-0'}`}>
              <ChatSection onProfileClick={() => setIsProfileOpen(!isProfileOpen)} />
            </div>
            <div
              className={`fixed right-0 top-0 bottom-0 transition-transform duration-300 ease-in-out ${isProfileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <RightSidebar
                userSelected={selectedUser}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
