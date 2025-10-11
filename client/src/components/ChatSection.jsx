import React, { useContext, useState, useEffect, useRef } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Helper function to format date
const formatMessageTime = (date) => {
  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatSection = ({ onProfileClick }) => {
  const { messages, selectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const chatEndRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Fetch messages when selected user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadMessages = async () => {
      if (!selectedUser) return;
      try {
        setIsLoading(true);
        await getMessages(selectedUser._id);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    // Cleanup function to handle component unmount
    return () => {
      isMounted = false;
    };
  }, [selectedUser?._id]); // Only depend on the ID, not the whole user object

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Create a blob URL for preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedImage(file);

      // Clean up the blob URL when preview is set
      return () => URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error creating preview:', error);
      toast.error('Failed to preview image');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Check if we have either text or image
    if ((!input.trim() && !selectedImage) || !selectedUser) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      setSending(true);
      let imageBase64 = null;

      if (selectedImage) {
        try {
          // Create a new image for dimension checking
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(selectedImage);
          });

          // Compress image if needed
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions if image is too large
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
          });

          // Convert blob to base64
          imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Image processing error:', error);
          toast.error(error.message || 'Failed to process image');
          setSending(false);
          return;
        }
      }

      // Send message
      await sendMessage({
        content: input.trim(),
        image: imageBase64
      });

      // Clear the form
      setInput("");
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.msg || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Effect to handle online status updates
  useEffect(() => {
    if (socket && selectedUser) {
      socket.emit("getOnlineUsers");
    }
  }, [socket, selectedUser]);

  // Handle initial state - no user selected
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-stone-950/95 backdrop-blur-sm text-stone-400">
        <p className="text-lg">Select a user to start chatting</p>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full bg-stone-950/95 backdrop-blur-sm text-stone-100 animate-fadeIn">
        {/* Keep the header visible while loading */}
        <div className="flex items-center justify-between bg-stone-900/90 px-6 py-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 opacity-75"></div>
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt={selectedUser?.fullname}
                className="absolute inset-0 h-12 w-12 rounded-full border-2 border-amber-500 shadow-[0_0_15px_rgba(251,146,60,0.3)] object-cover transition-opacity duration-300"
                style={{ opacity: selectedUser ? 1 : 0 }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-6 bg-gradient-to-r from-stone-700 to-stone-800 rounded animate-pulse" style={{ width: selectedUser?.fullname ? 'auto' : '120px' }}>
                <h2 className="text-lg font-semibold transition-opacity duration-300" style={{ opacity: selectedUser ? 1 : 0 }}>
                  {selectedUser?.fullname}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Loading animation in chat area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 w-12 h-12 bg-orange-500 rounded-full blur-xl animate-pulse opacity-50"></div>
              <div className="relative w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin transition-all duration-500 ease-in-out"></div>
            </div>
            <p className="text-stone-400 animate-pulse transition-all duration-300">Loading your messages...</p>
            {/* Loading chat bubbles animation */}
            <div className="flex flex-col gap-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-10 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 animate-pulse transition-all duration-300`} 
                     style={{ 
                       width: `${Math.max(100, Math.random() * 200)}px`,
                       animationDelay: `${i * 150}ms`,
                       opacity: 0.5 - (i * 0.1)
                     }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-stone-950/95 backdrop-blur-sm text-stone-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-stone-900/90 px-6 py-4 shadow-lg">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onProfileClick}
        >
          <div className="relative group">
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt={selectedUser.fullname}
              className="h-12 w-12 rounded-full border-2 border-amber-500 shadow-[0_0_15px_rgba(251,146,60,0.3)] object-cover"
            />
            <span 
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-stone-900 ${
                isUserOnline ? 'bg-green-500' : 'bg-stone-500'
              }`}
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">
              {selectedUser.fullname}
            </h2>
            <p className="text-sm text-stone-400">
              {selectedUser.bio || 'No bio set'}
            </p>
          </div>
        </div>

        <span className={`text-sm ${isUserOnline ? 'text-green-400' : 'text-stone-400'}`}>
          {isUserOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {Array.isArray(messages) && messages.map((msg, index) => {
          // Allow messages with either text or image
          const messageContent = msg?.text || msg?.content;
          if (!messageContent && !msg?.image) {
            console.log('Invalid message:', msg);
            return null;
          }
          
          return (
            <div 
              key={msg._id || index} 
              className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col">
                <div 
                  className={`px-4 py-2 rounded-2xl max-w-sm shadow-lg ${
                    msg.senderId === authUser._id 
                      ? 'bg-orange-500 text-white ml-12' 
                      : 'bg-stone-800/90 text-stone-100 mr-12'
                  }`}
                >
                {msg.image && (
                  <div className="mt-2 relative group">
                    <div className="relative rounded-lg overflow-hidden border border-stone-700/50">
                      <img
                        src={msg.image}
                        alt="Message attachment"
                        className="max-w-[300px] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.target.parentElement.innerHTML = `
                            <div class="flex items-center gap-2 p-3 bg-stone-800/50 rounded-lg text-stone-400">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                              </svg>
                              <span>Failed to load image</span>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <a
                      href={msg.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-stone-900/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-800"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-100" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
                
                {messageContent && <div className="break-words">{messageContent}</div>}
                
                {/* Message metadata */}
                <div className={`flex items-center gap-2 mt-1 text-xs ${
                  msg.senderId === authUser._id 
                    ? 'justify-end text-orange-200/70' 
                    : 'justify-start text-stone-400'
                }`}>
                  <span>{formatMessageTime(msg.createdAt)}</span>
                </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-stone-900/90">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          {previewImage && (
            <div className="relative w-48 group">
              <div className="relative rounded-lg overflow-hidden border-2 border-orange-500/50 aspect-square">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedImage(null);
                  }}
                  className="bg-stone-900/90 p-2 rounded-full hover:bg-stone-800 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-100" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-stone-800 hover:bg-stone-700 p-3 rounded-xl transition-all duration-200 group relative"
                disabled={sending || isLoading}
              >
                <img
                  src={assets.gallery_icon}
                  alt="attach"
                  className={`h-6 w-6 ${sending ? 'opacity-50' : ''} transition-transform group-hover:scale-110`}
                />
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {selectedImage && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  1
                </div>
              )}
            </div>
            <input
              type="text"
              className="flex-1 bg-stone-800/90 text-stone-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder-stone-400"
              placeholder={selectedImage ? "Add a message or send image" : "Type a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || isLoading}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || sending || isLoading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/20 relative group"
            >
              <img 
                src={assets.send_button} 
                alt="send" 
                className={`h-6 w-6 ${sending ? 'opacity-50' : ''} transition-transform group-hover:scale-110`} 
              />
              {sending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatSection;