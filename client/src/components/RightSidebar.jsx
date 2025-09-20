import React from 'react';
import assets, { imagesDummyData } from '../assets/assets';

function RightSidebar({ userSelected }) {
  return userSelected ? (
    <div className="flex flex-col items-center bg-gray-800 text-gray-100 p-8 rounded-xl w-[32rem] overflow-hidden">
      <img 
        src={userSelected.profilePic || assets.avatar_icon} 
        alt="profile" 
        className="h-28 w-28 rounded-full border-2 border-gray-700 mb-4" 
      />
      <span className="flex items-center text-green-400 mb-2">
        <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
        Online
      </span>
      <p className="text-2xl font-semibold mb-4">{userSelected.fullName}</p>
      <hr className="w-full border-gray-600 mb-4"/>
      <div className="w-full">
        <p className="text-white font-semibold mb-2">Media</p>
        <div className="grid grid-cols-3 gap-2">
          {imagesDummyData.map((url, index) => (
            <div 
              key={index} 
              className="w-full h-24 overflow-hidden rounded-lg cursor-pointer"
              onClick={() => window.open(url)}
            >
              <img 
                src={url} 
                alt="" 
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;
}

export default RightSidebar;
