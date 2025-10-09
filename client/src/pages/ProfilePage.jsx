import React, { useState, useContext } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext)
  const [bio, setBio] = useState(authUser?.bio || "")
  const [image, setImage] = useState(null)
  const [fullName, setFullName] = useState(authUser?.fullname || "")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // No image uploaded → update text fields only
    if (!image) {
      await updateProfile({ fullname: fullName, bio })
      navigate('/')
      return
    }

    // Convert uploaded image to base64
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onloadend = async () => {
      await updateProfile({
        fullname: fullName,
        bio,
        profilePic: reader.result, // match backend key
      })
      navigate('/')
    }

    reader.onerror = () => {
      console.error("Error reading image file")
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-gray-100 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-xl w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h3 className="text-2xl font-semibold text-center mb-6">Profile Details</h3>

          {/* Flex container: form fields left, avatar right */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
            
            {/* Left: Fullname + Bio */}
            <div className="flex-1 w-full">
              {/* Display Name */}
              <div className="mb-4">
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
              <div>
                <p className="text-sm mb-2 text-gray-300">Change your Bio</p>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Enter a valid Bio"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 outline-none text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none h-24"
                ></textarea>
              </div>
            </div>

            {/* Right: Avatar Upload */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                hidden
                accept="image/*"
                id="avatar"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <label htmlFor="avatar" className="cursor-pointer flex flex-col items-center">
                <img
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : authUser?.profilePic || assets.avatar_icon
                  }
                  alt="avatar preview"
                  className="h-40 w-40 rounded-full object-cover border-4 border-blue-600 shadow-md mb-3 hover:scale-105 transition-transform"
                />
                <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium text-center">
                  Upload New Profile Pic
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium text-sm mt-4"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
