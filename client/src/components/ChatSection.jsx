import React, { useContext, useState, useEffect, useRef } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function ChatSection() {
  const { messages, selectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    try {
      setSending(true);
      await sendMessage({ content: input.trim() });
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-stone-950 text-stone-400 pr-72">
        <p className="text-lg">Select a user to start chatting</p>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex flex-col h-screen w-full bg-stone-950 text-stone-100 p-6 pr-72">
      {/* Header */}
      <div className="flex items-center justify-between bg-stone-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)]">
        <div className="flex items-center gap-4">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt={selectedUser.fullname}
            className="h-12 w-12 rounded-full border-2 border-amber-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] object-cover"
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">{selectedUser.fullname}</p>
            <span className={`flex items-center text-sm ${isUserOnline ? 'text-green-400' : 'text-stone-400'}`}>
              <span className={`h-2 w-2 ${isUserOnline ? 'bg-green-500' : 'bg-stone-500'} rounded-full mr-1 border-2 border-stone-900`}></span>
              {isUserOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* User Bio */}
        <div className="text-sm text-stone-400">
          {selectedUser.bio || 'No bio set'}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 p-2">
        {messages.map((msg, index) => (
          <div 
            key={msg._id || index} 
            className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`px-4 py-2 rounded-2xl max-w-xs shadow-[0_4px_12px_-2px_rgba(251,146,60,0.3)] ${
                msg.senderId === authUser._id 
                  ? 'bg-orange-500/20 text-orange-50' 
                  : 'bg-stone-800/80 text-stone-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="mt-4">
        <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur-xl p-2 rounded-3xl">
          <input
            type="text"
            className="flex-1 bg-stone-800/80 text-stone-100 px-4 py-2 rounded-2xl focus:outline-none placeholder-stone-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 p-2 rounded-full transition-colors duration-200"
          >
            <img src={assets.send_button} alt="send" className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatSection;
