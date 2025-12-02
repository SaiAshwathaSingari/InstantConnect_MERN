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
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false); // Track user switching transition
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Resolve image source: if server returns relative path, prefix API URL
  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    // fallback: prefix with env variable (set REACT_APP_API_URL in .env)
    return `${process.env.REACT_APP_API_URL || ''}${img}`;
  };

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
          setIsTransitioning(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedUser?._id]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // cleanup preview URL when preview changes/unmount
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        try { URL.revokeObjectURL(previewImage); } catch (e) { /* ignore */ }
      }
    };
  }, [previewImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // revoke old preview if present
    if (previewImage && previewImage.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewImage); } catch (e) { /* ignore */ }
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setSelectedImage(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !selectedUser) {
      return;
    }

    const messageText = input.trim();
    const imageFile = selectedImage;
    
    // Clear form immediately for instant UI feedback
    setInput('');
    setSelectedImage(null);
    if (previewImage && previewImage.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewImage); } catch (e) { /* ignore */ }
    }
    setPreviewImage(null);

    try {
      setSending(true);
      let imageBase64 = null;

      if (imageFile) {
        try {
          // Process image in background
          const img = new Image();
          const objectUrl = URL.createObjectURL(imageFile);
          img.src = objectUrl;

          await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load selected image'));
          });

          try { URL.revokeObjectURL(objectUrl); } catch (e) { /* ignore */ }

          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
          if (!blob) throw new Error('Failed to compress image');

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

      // Send message without waiting for response
      sendMessage({ content: messageText, image: imageBase64 }).catch(error => {
        console.error('Send message error:', error);
        toast.error('Failed to send message');
      });

    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle image load errors from messages
  const handleImageError = (msgId) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(msgId);
      return next;
    });
  };


  // Effect to handle online status updates
  useEffect(() => {
    if (socket && selectedUser) {
      socket.emit('getOnlineUsers');
    }
  }, [socket, selectedUser]);

  // Mark messages as seen when chat is focused or user switches to this chat
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      // Find unseen messages from the selected user
      const unseenMessages = messages.filter(msg => 
        msg.senderId === selectedUser._id && !msg.seen
      );
      
      if (unseenMessages.length > 0) {
        // Mark messages as seen after a short delay (to ensure user has seen them)
        const timer = setTimeout(() => {
          fetch(`${process.env.REACT_APP_API_URL || ''}/api/message/mark/${selectedUser._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }).catch(console.error);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedUser, messages]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen w-full glass text-stone-400 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-orange-400/20 rounded-full animate-float"></div>
          <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-amber-400/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-orange-300/25 rounded-full animate-float"></div>
        </div>
        
        <div className="text-center animate-fadeInUp">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full glass flex items-center justify-center glow-effect">
            <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-stone-200 mb-2">Start a Conversation</h3>
          <p className="text-stone-400">Select a user from the sidebar to begin chatting</p>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full glass text-stone-100 relative overflow-hidden animate-fadeIn">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-2 h-2 bg-orange-400/20 rounded-full animate-float"></div>
          <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-amber-400/25 rounded-full animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-300/30 rounded-full animate-float"></div>
        </div>

        {/* Header Skeleton */}
        <div className="glass border-b border-white/10 px-6 py-4 relative overflow-hidden animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full glass animate-skeleton border-2 border-white/20"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-stone-500 border-2 border-stone-900"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-5 w-32 glass rounded animate-skeleton"></div>
                <div className="h-3 w-24 glass rounded animate-skeleton"></div>
              </div>
            </div>
            <div className="h-6 w-16 glass rounded-full animate-skeleton"></div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-8 animate-fadeInUp animate-stagger-2">
            {/* Enhanced loading spinner */}
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-full blur-xl animate-pulse-glow"></div>
              <div className="relative w-14 h-14 border-4 border-transparent bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-spin">
                <div className="absolute inset-1 bg-stone-950 rounded-full"></div>
              </div>
              <div className="absolute inset-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-stone-200 mb-2 animate-pulse">Loading Messages</h3>
              <p className="text-stone-400 animate-pulse">Preparing your conversation...</p>
            </div>

            {/* Message Skeletons */}
            <div className="flex flex-col gap-4 w-full max-w-md">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-fadeInUp`}
                     style={{ animationDelay: `${(i + 3) * 0.1}s` }}>
                  <div className={`glass rounded-2xl p-4 animate-skeleton transition-all duration-300 ${
                    i % 2 === 0 ? 'mr-12' : 'ml-12'
                  }`} 
                       style={{ 
                         width: `${Math.max(120, Math.random() * 200)}px`,
                         height: `${Math.max(40, Math.random() * 60)}px`
                       }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="glass border-t border-white/10 p-6 animate-fadeInUp animate-stagger-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 glass rounded-2xl animate-skeleton"></div>
            <div className="flex-1 h-12 glass rounded-2xl animate-skeleton"></div>
            <div className="w-12 h-12 glass rounded-2xl animate-skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full glass text-stone-100 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-2 h-2 bg-orange-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-amber-400/25 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-300/30 rounded-full animate-float"></div>
      </div>

      {/* Enhanced Header */}
      <div className="glass border-b border-white/10 px-6 py-5 relative overflow-hidden animate-fadeInUp glow-effect">
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/8 via-amber-500/4 to-orange-500/8 animate-gradient pointer-events-none"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`
        }}></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div 
            className="flex items-center gap-5 cursor-pointer transition-all duration-300 
              professional-hover smooth-scale enhanced-glow p-3 rounded-2xl hover:bg-white/8"
            onClick={onProfileClick}
          >
            <div className="relative">
              <div className="relative group/avatar">
                {/* Glow effect for online users */}
                {isUserOnline && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 animate-pulse-glow"></div>
                )}
                <img
                  src={selectedUser.profilePic || assets.avatar_icon}
                  alt={selectedUser.fullname}
                  className="h-16 w-16 rounded-full border-3 border-white/30 object-cover relative z-10
                    group-hover/header:border-orange-400/60 transition-all duration-300
                    group-hover/avatar:scale-105 shadow-xl"
                />
                {/* Enhanced online status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-stone-900 
                  transition-all duration-300 ${
                  isUserOnline 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.9)] animate-pulse-glow' 
                    : 'bg-gradient-to-r from-stone-500 to-stone-600'
                }`}>
                  {isUserOnline && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60"></div>
                  )}
                  {/* Inner dot for better visibility */}
                  <div className={`absolute inset-1 rounded-full ${
                    isUserOnline ? 'bg-white' : 'bg-stone-300'
                  }`}></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-stone-100 group-hover/header:text-orange-200 transition-colors duration-200">
                {selectedUser.fullname}
              </h2>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    isUserOnline 
                      ? 'text-green-400' 
                      : 'text-stone-400'
                  }`}>
                    {isUserOnline ? 'Online' : 'Last seen recently'}
                  </span>
                  {isUserOnline && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className="text-xs text-stone-500 group-hover/header:text-stone-400 transition-colors duration-200">
                  {selectedUser.bio || 'Hey there! I am using InstantConnect'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 ${
              isUserOnline 
                ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
                : 'text-stone-400 bg-stone-400/10 border border-stone-400/20'
            }`}>
              {isUserOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {Array.isArray(messages) && messages.map((msg, index) => {
          const messageContent = msg?.text || msg?.content;
          // Always show messages - don't skip any
          // if (!messageContent && !msg?.image && !msg?.file) {
          //   return null; // Only skip if completely empty
          // }

          const imageSrc = resolveImageSrc(msg.image);
          const hasImageFailed = failedImages.has(msg._id || index);

          return (
            <div 
              key={msg._id || index} 
              className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'} animate-message-in`}
            >
              <div className="flex flex-col group/message">
                <div 
                  className={`px-5 py-3 rounded-2xl max-w-sm shadow-lg transition-all duration-300 relative overflow-hidden
                    professional-hover smooth-scale group/bubble ${
                    msg.senderId === authUser._id 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ml-12 hover:shadow-orange-500/30' 
                      : 'professional-card text-stone-100 mr-12 hover:border-orange-400/20'
                  }`}
                >
                  {imageSrc && !hasImageFailed && (
                    <div className="mt-2 relative group animate-image-reveal">
                      <div className="relative rounded-lg overflow-hidden border border-stone-700/50 shadow-lg">
                        <img
                          src={imageSrc}
                          alt="Message attachment"
                          className="max-w-[300px] w-full object-cover transition-all duration-500 group-hover:scale-[1.02] animate-image-reveal"
                          onError={() => handleImageError(msg._id || index)}
                          onLoad={(e) => {
                            e.target.classList.add('animate-image-reveal');
                            e.target.style.filter = 'blur(0px)';
                          }}
                          style={{ filter: 'blur(5px)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Loading shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                      </div>
                      <a
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-stone-900/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-100" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {imageSrc && hasImageFailed && (
                    <div className="mt-2 p-3 bg-stone-800/50 rounded-lg text-stone-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Failed to load image</span>
                    </div>
                  )}

                  {/* Enhanced message content */}
                  {messageContent && (
                    <div className="break-words text-[15px] leading-relaxed">
                      {messageContent}
                    </div>
                  )}

                  {/* File display */}
                  {msg.file && (
                    <div className="mt-3 p-3 glass rounded-lg border border-white/10 hover:border-white/20 transition-colors duration-200">
                      <a href={msg.file} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors duration-200">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{msg.fileName || 'File'}</div>
                          <div className="text-xs opacity-70">Click to download</div>
                        </div>
                      </a>
                    </div>
                  )}
                  {!messageContent && !msg?.image && !msg?.file && (
                    <div className="text-stone-400 italic text-sm">Empty message</div>
                  )}

                  <div className={`flex items-center gap-2 mt-1 text-xs ${
                    msg.senderId === authUser._id 
                      ? 'justify-end text-orange-200/70' 
                      : 'justify-start text-stone-400'
                  }`}>
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    
                    {/* Message seen indicator for sent messages */}
                    {msg.senderId === authUser._id && (
                      <div className="flex items-center gap-1">
                        {msg.seen ? (
                          <div className="flex items-center gap-0.5" title="Seen">
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-3 h-3 text-blue-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center" title="Sent">
                            <svg className="w-3 h-3 text-stone-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/10 p-6 relative overflow-hidden animate-fadeInUp animate-stagger-3">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5 animate-gradient pointer-events-none"></div>
        <form onSubmit={handleSendMessage} className="flex flex-col gap-4 relative z-10">
          {previewImage && (
            <div className="relative w-48 group animate-image-upload">
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-400/50 aspect-square glass">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 animate-image-reveal" 
                  onLoad={(e) => e.target.classList.add('animate-image-reveal')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Upload progress indicator */}
                {sending && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-2xl overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-image-progress"></div>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (previewImage && previewImage.startsWith('blob:')) {
                    try { URL.revokeObjectURL(previewImage); } catch (e) { /* ignore */ }
                  }
                  setPreviewImage(null);
                  setSelectedImage(null);
                }} 
                className="absolute -top-2 -right-2 glass p-2 rounded-full hover:bg-red-500/20 transition-all duration-200 magnetic glow-effect border border-white/20 group-hover:scale-110"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="professional-card p-3 rounded-2xl transition-all duration-300 group relative enhanced-glow smooth-scale
                  hover:border-orange-400/40 hover:bg-white/10"
                disabled={sending || isLoading}
              >
                <svg className={`w-6 h-6 text-orange-400 ${sending ? 'opacity-50' : ''} transition-all duration-300 group-hover:scale-110`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              {selectedImage && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs w-6 h-6 
                  rounded-full flex items-center justify-center animate-pulse-glow shadow-lg">
                  1
                </div>
              )}
            </div>

            
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  className="w-full glass text-stone-100 px-6 py-4 pr-12 rounded-2xl focus:outline-none 
                    focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30
                    placeholder-stone-400 transition-all duration-300 border border-white/10
                    hover:border-white/20 focus:shadow-[0_0_30px_rgba(251,146,60,0.2)]
                    text-base leading-relaxed"
                  placeholder={selectedImage ? 'Add a message or send image...' : 'Type your message...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending || isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                
                {/* Character count for long messages */}
                {input.length > 100 && (
                  <div className="absolute bottom-1 right-3 text-xs text-stone-500">
                    {input.length}/1000
                  </div>
                )}
                
                {/* Emoji button */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setInput(prev => prev + '😊')}
                >
                  <span className="text-lg">😊</span>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || sending || isLoading}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 
                disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl transition-all duration-300 
                shadow-lg hover:shadow-orange-500/30 relative group magnetic glow-effect
                hover:scale-110 active:scale-95 disabled:hover:scale-100"
            >
              <svg className={`w-6 h-6 text-white ${sending ? 'opacity-50' : ''} transition-all duration-300 group-hover:scale-110`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {sending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
