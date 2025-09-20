import React from 'react'
import assets, { messagesDummyData } from '../assets/assets'

function ChatSection({ userSelected, setUserSelected }) {
  return userSelected ? (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-gray-100 p-6 pr-72">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-4">
          <img 
            src={assets.profile_martin} 
            alt="profile" 
            className="h-12 w-12 rounded-full border-2 border-gray-700"
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Martin</p>
            <span className="flex items-center text-sm text-green-400">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
              Online
            </span>
          </div>
        </div>

        {/* Help icon */}
        <img 
          src={assets.help_icon} 
          alt="help" 
          className="h-6 w-6 cursor-pointer opacity-70 hover:opacity-100 transition"
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 p-2">
        {messagesDummyData.map((msg, index) => (
          <div key={msg._id || index} className="flex">
            {msg.text ? (
              <p className="bg-gray-700 text-gray-100 px-4 py-2 rounded-xl max-w-xs shadow-md">
                {msg.text}
              </p>
            ) : (
              <img 
                src={msg.image} 
                alt="chat-img" 
                className="max-h-48 rounded-xl shadow-md border border-gray-600"
              />
            )}
          </div>
        ))}
      </div>
      {/* Input Area */}
  {/* Input Area */}
<div className="flex items-center gap-2 mt-2 bg-gray-800 p-2 rounded-xl">
  <input 
    type="text" 
    className="flex-1 bg-gray-700 text-gray-100 px-4 py-2 rounded-xl focus:outline-none placeholder-gray-400" 
    placeholder="Type a message..."
  />
  <input type="file" 
  id="fileInput"
    accept='image/*'
    className="hidden"
  />
  <label 
  htmlFor="fileInput" 
  className="cursor-pointer bg-gray-700 text-gray-100 px-4 py-2 rounded-xl hover:bg-gray-600"
>
  <img src={assets.gallery_icon} alt="" />
</label>

  <img 
    src={assets.send_button} 
    alt="send" 
    className="h-10 w-10 cursor-pointer"
  />
</div>

    </div>
  ) : (
    <div className="flex items-center justify-center h-screen w-full bg-gray-900 text-gray-400 pr-72">
      <p className="text-lg">Chat any time, anywhere using Insta Connect</p>
    </div>
  )
  
}

export default ChatSection
