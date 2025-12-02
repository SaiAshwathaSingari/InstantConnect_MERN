import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [image, setImage] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullname || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  // Validation functions
  const validateFullname = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 50) return "Name must be less than 50 characters";
    return "";
  };

  const validateBio = (bio) => {
    if (!bio) return "Bio is required";
    if (bio.length < 10) return "Bio must be at least 10 characters";
    if (bio.length > 200) return "Bio must be less than 200 characters";
    return "";
  };

  // Handle field changes with validation
  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'fullname':
        setFullName(value);
        if (touched.fullname) {
          setErrors(prev => ({ ...prev, fullname: validateFullname(value) }));
        }
        break;
      case 'bio':
        setBio(value);
        if (touched.bio) {
          setErrors(prev => ({ ...prev, bio: validateBio(value) }));
        }
        break;
    }
  };

  // Handle field blur
  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
      case 'fullname':
        setErrors(prev => ({ ...prev, fullname: validateFullname(fullName) }));
        break;
      case 'bio':
        setErrors(prev => ({ ...prev, bio: validateBio(bio) }));
        break;
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const fullnameError = validateFullname(fullName);
    const bioError = validateBio(bio);

    // Set all errors
    setErrors({
      fullname: fullnameError,
      bio: bioError
    });

    // Mark all fields as touched
    setTouched({
      fullname: true,
      bio: true
    });

    // Check if there are any errors
    const hasErrors = fullnameError || bioError;

    if (hasErrors) {
      setIsLoading(false);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      if (!image) {
        await updateProfile({ fullname: fullName, bio });
        toast.success("Profile updated successfully!");
        navigate('/');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        try {
          await updateProfile({
            fullname: fullName,
            bio,
            profilePic: reader.result,
          });
          toast.success("Profile updated successfully!");
          navigate('/');
        } catch (error) {
          toast.error("Failed to update profile");
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error("Error reading image file");
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      setIsLoading(false);
    }
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

      <div className="w-full max-w-4xl rounded-3xl border border-stone-800/80 bg-stone-900/75 backdrop-blur-xl
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] p-8 lg:p-12
        transition-all duration-500 ease-out motion-safe:hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)]
        motion-safe:hover:scale-[1.01] motion-safe:hover:border-amber-500/30
        relative overflow-hidden group animate-fadeInUp"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10">
          <div className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-pulse" style={{top: '15%', left: '15%', animationDelay: '0s'}}></div>
          <div className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-pulse" style={{top: '70%', left: '85%', animationDelay: '1s'}}></div>
          <div className="absolute w-1.5 h-1.5 bg-amber-300/25 rounded-full animate-pulse" style={{top: '85%', left: '10%', animationDelay: '2s'}}></div>
          <div className="absolute w-1 h-1 bg-orange-300/35 rounded-full animate-pulse" style={{top: '25%', left: '80%', animationDelay: '1.5s'}}></div>
        </div>

        {/* Enhanced Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-block group/title">
            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 
              bg-clip-text drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] mb-2 animate-gradient">
              Edit Profile
            </h3>
            <p className="text-stone-400 text-lg">Customize your InstantConnect experience</p>
            {/* Animated underline */}
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full
              group-hover/title:w-32 transition-all duration-300"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1 flex flex-col items-center justify-start">
              <div className="professional-card p-6 rounded-2xl w-full">
                <p className="text-lg font-semibold mb-6 text-center text-stone-200">Profile Picture</p>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  id="avatar"
                  onChange={handleImageChange}
                />
                <label htmlFor="avatar" className="cursor-pointer flex flex-col items-center group/avatar">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 animate-pulse-glow"></div>
                    <img
                      src={previewImage || authUser?.profilePic || assets.avatar_icon}
                      alt="avatar preview"
                      className="h-32 w-32 rounded-full object-cover border-4 border-amber-500/50 shadow-[0_8px_22px_rgba(251,146,60,0.35)] 
                      group-hover/avatar:scale-105 transition-all duration-300 group-hover/avatar:border-amber-400 relative z-10"
                    />
                    {/* Upload overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 
                      transition-opacity duration-300 flex items-center justify-center z-20">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <span className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500
                  hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 text-stone-950 font-semibold text-sm 
                  transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 w-full justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {previewImage ? "Change Picture" : "Upload Picture"}
                  </span>
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreviewImage(null);
                    }}
                    className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors underline w-full text-center"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Name Card */}
              <div className="professional-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-stone-200">Display Name</h4>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    onChange={(e) => handleFieldChange('fullname', e.target.value)}
                    onBlur={() => handleFieldBlur('fullname')}
                    value={fullName}
                    placeholder="Enter your full name"
                    className={`w-full px-5 py-4 rounded-xl bg-stone-800/50 border text-stone-100 placeholder:text-stone-400
                    shadow-inner transition-all duration-300 ease-out focus:outline-none text-lg
                    focus-visible:ring-2 focus-visible:ring-amber-500/50 focus:bg-stone-800/70
                    hover:bg-stone-800/60 hover:shadow-[0_0_20px_rgba(251,146,60,0.1)]
                    ${errors.fullname && touched.fullname 
                      ? 'border-red-500/70 focus-visible:border-red-400 focus-visible:ring-red-500/25' 
                      : 'border-stone-600/50 focus-visible:border-amber-400 hover:border-amber-500/30'
                    }`}
                  />
                  {errors.fullname && touched.fullname && (
                    <div className="absolute -bottom-6 left-0 text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.fullname}
                    </div>
                  )}
                  {!errors.fullname && touched.fullname && fullName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Card */}
              <div className="professional-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-stone-200">About You</h4>
                </div>
                <div className="relative">
                  <textarea
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    onBlur={() => handleFieldBlur('bio')}
                    value={bio}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className={`w-full px-5 py-4 rounded-xl bg-stone-800/50 border text-stone-100 placeholder:text-stone-400
                    shadow-inner transition-all duration-300 ease-out focus:outline-none resize-none text-base leading-relaxed
                    focus-visible:ring-2 focus-visible:ring-amber-500/50 focus:bg-stone-800/70
                    hover:bg-stone-800/60 hover:shadow-[0_0_20px_rgba(251,146,60,0.1)]
                    ${errors.bio && touched.bio 
                      ? 'border-red-500/70 focus-visible:border-red-400 focus-visible:ring-red-500/25' 
                      : 'border-stone-600/50 focus-visible:border-amber-400 hover:border-amber-500/30'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-stone-500">
                    {bio.length}/200
                  </div>
                  {errors.bio && touched.bio && (
                    <div className="absolute -bottom-6 left-0 text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.bio}
                    </div>
                  )}
                  {!errors.bio && touched.bio && bio && (
                    <div className="absolute top-3 right-10 text-green-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Avatar */}
            <div className="flex flex-col items-center">
              <p className="text-sm mb-4 text-stone-300 font-medium text-center">Profile Picture</p>
              <input
                type="file"
                hidden
                accept="image/*"
                id="avatar"
                onChange={handleImageChange}
              />
              <label htmlFor="avatar" className="cursor-pointer flex flex-col items-center group/avatar">
                <div className="relative">
                  <img
                    src={
                      previewImage || authUser?.profilePic || assets.avatar_icon
                    }
                    alt="avatar preview"
                    className="h-40 w-40 rounded-full object-cover border-4 border-amber-500 shadow-[0_8px_22px_rgba(251,146,60,0.35)] 
                    group-hover/avatar:scale-105 transition-all duration-300 group-hover/avatar:border-amber-400"
                  />
                  {/* Upload overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 
                    transition-opacity duration-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <span className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500
                hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 text-stone-950 font-semibold text-sm 
                transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {previewImage ? "Change Picture" : "Upload Picture"}
                </span>
              </label>
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreviewImage(null);
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors underline"
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-xl border-2 border-stone-600/50 text-stone-300 font-semibold text-lg
              hover:border-stone-500 hover:text-stone-200 hover:bg-stone-800/30 transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 
              flex items-center justify-center gap-2 group professional-hover"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-4 rounded-xl relative overflow-hidden group/btn font-semibold text-lg tracking-wide
              ${isLoading 
                ? 'bg-gradient-to-r from-stone-600 to-stone-700 cursor-not-allowed text-stone-400' 
                : 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 text-stone-950'
              }
              shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)]
              hover:shadow-[0_16px_40px_-12px_rgba(251,146,60,0.8)]
              transition-all duration-300 ease-out enhanced-glow
              ${!isLoading && 'motion-safe:hover:translate-y-[-2px] motion-safe:hover:scale-[1.02]'}
              motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/10 before:to-transparent 
              ${!isLoading && 'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-stone-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Save Changes
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
