import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [image, setImage] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullname || "");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      await updateProfile({ fullname: fullName, bio });
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      await updateProfile({
        fullname: fullName,
        bio,
        profilePic: reader.result,
      });
      navigate('/');
    };
    reader.onerror = () => console.error("Error reading image file");
  };

  // Cursor spotlight
  const onMouseMove = (e) => {
    const root = e.currentTarget;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
  };

  return (
    <div
      onMouseMove={onMouseMove}
      className="min-h-screen flex items-center justify-center px-6 lg:px-12 text-stone-100 relative isolate
      bg-stone-950
      bg-[radial-gradient(1200px_700px_at_18%_-10%,rgba(251,146,60,0.10),transparent_55%),radial-gradient(1100px_650px_at_88%_110%,rgba(245,158,11,0.10),transparent_55%),conic-gradient(from_210deg_at_55%_40%,rgba(255,255,255,0.035),transparent_30%) ]
      bg-blend-overlay transition-colors duration-300 ease-out"
      style={{
        "--mx": "50vw",
        "--my": "50vh",
      }}
    >
      {/* Cursor-following amber glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(200px 200px at var(--mx) var(--my), rgba(251,146,60,0.18), rgba(245,158,11,0.08) 40%, transparent 65%)",
          transition: "background-position 120ms ease, opacity 200ms ease",
        }}
      />
      {/* Subtle grain overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" aria-hidden="true"></div>

      <div className="w-full max-w-2xl rounded-3xl border border-stone-800/80 bg-stone-900/75 backdrop-blur-xl
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] p-10 lg:p-14
        transition-shadow duration-300 ease-out motion-safe:hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)]"
      >
        <h3 className="text-2xl font-semibold text-center mb-8 text-stone-100 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)]">
          Profile Details
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
            {/* Left: Fullname + Bio */}
            <div className="flex-1 w-full">
              {/* Full Name */}
              <div className="mb-4">
                <p className="text-sm mb-2 text-stone-300">Change your Display Name</p>
                <input
                  type="text"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  placeholder="Enter your full name"
                  className="w-full px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
                  shadow-inner transition-all duration-200 ease-out focus:outline-none
                  focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 motion-safe:focus:scale-[1.01]"
                />
              </div>

              {/* Bio */}
              <div>
                <p className="text-sm mb-2 text-stone-300">Change your Bio</p>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Enter a valid Bio"
                  className="w-full px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
                  shadow-inner transition-all duration-200 ease-out focus:outline-none
                  focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 resize-none h-24"
                ></textarea>
              </div>
            </div>

            {/* Right: Avatar */}
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
                  className="h-40 w-40 rounded-full object-cover border-4 border-amber-500 shadow-[0_8px_22px_rgba(251,146,60,0.35)] mb-3 hover:scale-105 transition-transform"
                />
                <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500
                hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 text-stone-950 font-semibold text-sm transition-all">
                  Upload New Profile Pic
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl
            bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500
            hover:from-amber-500 hover:via-orange-500 hover:to-amber-400
            text-stone-950 font-semibold text-lg tracking-wide
            shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)]
            transition-all duration-200 ease-out
            motion-safe:hover:translate-y-[-1px]
            motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
