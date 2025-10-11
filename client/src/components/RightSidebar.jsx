import React from 'react';
import assets, { imagesDummyData } from '../assets/assets';

function RightSidebar({ userSelected }) {
  if (!userSelected) return null;

  return (
    <div className="flex flex-col items-center bg-stone-900/75 backdrop-blur-xl text-stone-100 p-8 rounded-3xl w-[32rem] overflow-hidden
      shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] transition-shadow duration-300 ease-out
      motion-safe:hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)]"
    >
      {/* Profile Pic */}
      <img
        src={userSelected.profilePic || assets.avatar_icon}
        alt="profile"
        className="h-28 w-28 rounded-full border-4 border-amber-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] mb-4"
      />

      {/* Online Status */}
      <span className="flex items-center text-green-400 mb-2">
        <span className="h-3 w-3 bg-green-500 rounded-full mr-2 border-2 border-stone-900"></span>
        Online
      </span>

      {/* Name */}
      <p className="text-2xl font-semibold mb-4 drop-shadow-[0_4px_12px_rgba(251,146,60,0.3)]">{userSelected.fullName}</p>

      <hr className="w-full border-stone-700 mb-4" />

      {/* Media Section */}
      <div className="w-full">
        <p className="text-stone-100 font-semibold mb-2">Media</p>
        <div className="grid grid-cols-3 gap-2">
          {imagesDummyData.map((url, index) => (
            <div
              key={index}
              className="w-full h-24 overflow-hidden rounded-2xl cursor-pointer shadow-[0_4px_12px_-2px_rgba(251,146,60,0.3)] hover:shadow-[0_8px_24px_-4px_rgba(251,146,60,0.35)] transition-all"
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
  );
}

export default RightSidebar;
