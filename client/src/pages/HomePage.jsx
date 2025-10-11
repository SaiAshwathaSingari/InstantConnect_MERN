import React from 'react';
import ChatSection from '../components/ChatSection';
import RightSidebar from '../components/RightSidebar';
import SideBar from '../components/SideBar';
import { ChatContext } from '../../context/ChatContext';

function HomePage() {
  const { selectedUser } = React.useContext(ChatContext);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  
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

      {/* Sidebar and main content */}
      <SideBar />
      <div className="flex-1 flex overflow-hidden">
        {selectedUser && (
          <>
            <div className={`flex-1 transition-all duration-300 ${isProfileOpen ? 'mr-[384px]' : 'mr-0'}`}>
              <ChatSection onProfileClick={() => setIsProfileOpen(!isProfileOpen)} />
            </div>
            <div 
              className={`fixed right-0 top-0 bottom-0 transition-transform duration-300 ease-in-out ${
                isProfileOpen ? 'translate-x-0' : 'translate-x-full'
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
