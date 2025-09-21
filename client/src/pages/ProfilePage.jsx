import React, { useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
  const [bio, setBio] = useState("I am using InstaConnect")
  const [image, setImage] = useState(null)
  const [fullName, setFullName] = useState("")
  const navigate = useNavigate()

  const HandleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-gray-100">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-xl w-full max-w-md">
        <form onSubmit={HandleSubmit} className="flex flex-col items-center gap-6">
          <h3 className="text-xl font-semibold text-center">Profile Details</h3>

          {/* Avatar Upload */}
          <input
            type="file"
            hidden
            accept="image/*"
            id="avatar"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="avatar" className="flex flex-col items-center cursor-pointer">
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt="avatar preview"
              className="h-24 w-24 rounded-full object-cover border-4 border-blue-600 shadow-md mb-3 hover:scale-105 transition-transform"
            />
            <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium">
              Upload New Profile Pic
            </span>
          </label>

          {/* Display Name */}
          <div className="w-full">
            <p className="text-sm mb-2 text-gray-300">Change your Display Name</p>
            <input
              type="text"
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 outline-none text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div className="w-full">
            <p className="text-sm mb-2 text-gray-300">Change your Bio</p>
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Enter a valid Bio"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 outline-none text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none h-24"
            ></textarea>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
