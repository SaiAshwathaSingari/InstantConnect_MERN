import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets, { userDummyData } from "../assets/assets"
import { AuthContext } from '../../context/AuthContext'

function SideBar({userSelected, setUserSelected}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const {logout} = React.useContext(AuthContext)
  return (
    <div className="h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col p-6 shadow-xl relative">
      <img src={assets.logo} alt="logo" className="mb-10 max-w-[140px] mx-auto hover:scale-105 transition-transform duration-300" />

      <div className="absolute top-6 right-6">
        <img
          src={assets.menu_icon}
          alt="menu_icon"
          className="h-7 w-7 cursor-pointer hover:rotate-90 transition-transform duration-300"
          onClick={() => setMenuOpen((prev) => !prev)}
        />
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-md bg-gray-800 border border-gray-700 shadow-lg z-50">
            <button 
              onClick={() => { 
                navigate('/profile')
                setMenuOpen(false) 
              }} 
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
            >
              Edit Profile
            </button>
            <hr className="border-gray-700" />
            <button 
              onClick={() =>{
                logout()
                navigate('/login')
                setMenuOpen(false)
              }} 
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 gap-2 mb-6 shadow-inner">
        <img src={assets.search_icon} alt="search" className="h-5 w-5 opacity-70" />
        <input
          type="text"
          placeholder="Search User..."
          className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto">
        {userDummyData.map((user, index) => (
          <div 
            onClick={()=>{setUserSelected(user)}}
            key={index} 
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer relative transition-colors"
          >
            <img 
              src={user?.profilePic || assets.avatar_icon} 
              alt="" 
              className="h-10 w-10 rounded-full border-2 border-gray-700"
            />
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
            </div>

            {index < 3 ? (
              <span className="absolute top-3 right-3 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
            ) : (
              <span className="absolute top-3 right-3 h-3 w-3 bg-gray-500 rounded-full border-2 border-gray-900"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SideBar
