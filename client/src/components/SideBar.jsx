import React from 'react'

import { useNavigate } from 'react-router-dom'
import assets, { imagesDummyData, userDummyData, messagesDummyData } from "../assets/assets"

function SideBar() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-72 bg-gray-900 text-gray-100 flex flex-col p-6 shadow-lg relative">
      <img src={assets.logo} alt="logo" className="mb-10 max-w-[140px]" />
      <div className="absolute top-6 right-6 group">
        <img
          src={assets.menu_icon}
          alt="menu_icon"
          className="h-7 w-7 cursor-pointer"
        />
        <div className="absolute hidden group-hover:block right-0 mt-2 w-44 rounded-md bg-gray-800 border border-gray-700 shadow-lg">
          <p onClick={() => navigate('/profile')} className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Edit Profile</p>
          <hr className="border-gray-700" />
          <p className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Log out</p>
        </div>
      </div>
      <div className="flex items-center bg-gray-800 rounded-md px-3 py-2 gap-2">
        <img src={assets.search_icon} alt="search" className="h-5 w-5 opacity-70" />
        <input
          type="text"
          placeholder="Search User..."
          className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
        />
      </div>
      <div>
        {userDummyData.map((user,index)=>{

        
        }

        )}
      </div>
    </div>
  )
}

export default SideBar
