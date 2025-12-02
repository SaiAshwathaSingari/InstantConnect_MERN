import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const [isState, setIsState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useContext(AuthContext);

  // Real-time validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return "";
  };

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
      case 'email':
        setEmail(value);
        if (touched.email) {
          setErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
        break;
      case 'password':
        setPassword(value);
        if (touched.password) {
          setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        }
        break;
      case 'fullname':
        setFullname(value);
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

  // Handle field blur (when user leaves field)
  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
      case 'email':
        setErrors(prev => ({ ...prev, email: validateEmail(email) }));
        break;
      case 'password':
        setErrors(prev => ({ ...prev, password: validatePassword(password) }));
        break;
      case 'fullname':
        setErrors(prev => ({ ...prev, fullname: validateFullname(fullname) }));
        break;
      case 'bio':
        setErrors(prev => ({ ...prev, bio: validateBio(bio) }));
        break;
    }
  };

  // Cursor spotlight handler (no content change, just interactivity)
  const onMouseMove = (e) => {
    const root = e.currentTarget;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    let fullnameError = "";
    let bioError = "";

    if (isState === "Sign Up") {
      fullnameError = validateFullname(fullname);
      bioError = validateBio(bio);
    }

    // Set all errors
    setErrors({
      email: emailError,
      password: passwordError,
      fullname: fullnameError,
      bio: bioError
    });

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      fullname: isState === "Sign Up",
      bio: isState === "Sign Up"
    });

    // Check if there are any errors
    const hasErrors = emailError || passwordError || fullnameError || bioError;

    if (hasErrors) {
      setIsLoading(false);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      if (isState === "Login") {
        await login("login", { email, password });
      } else {
        await login("signup", { fullname, email, password, bio });
      }
    } catch (error) {
      console.error("Login/Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onMouseMove={onMouseMove}
      className="min-h-screen flex items-center justify-center px-6 lg:px-12 text-stone-100 relative isolate
      bg-stone-950
      bg-[radial-gradient(1200px_700px_at_18%_-10%,rgba(251,146,60,0.10),transparent_55%),radial-gradient(1100px_650px_at_88%_110%,rgba(245,158,11,0.10),transparent_55%),conic-gradient(from_210deg_at_55%_40%,rgba(255,255,255,0.035),transparent_30%)]
      bg-blend-overlay transition-colors duration-300 ease-out"
      style={{
        // initial cursor glow position default center
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

      {/* Subtle grain/overlay layer for texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" aria-hidden="true"></div>

      <div className="w-full max-w-2xl rounded-3xl glass
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] p-10 lg:p-14
        transition-all duration-500 ease-out hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)]
        hover:scale-[1.02] hover:border-orange-500/30
        relative overflow-hidden group glow-effect animate-fadeInUp"
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 
          animate-gradient pointer-events-none"></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute w-2 h-2 bg-orange-400/30 rounded-full animate-float" style={{top: '20%', left: '10%'}}></div>
          <div className="absolute w-1 h-1 bg-amber-400/40 rounded-full animate-float-delayed" style={{top: '60%', left: '80%'}}></div>
          <div className="absolute w-1.5 h-1.5 bg-orange-300/25 rounded-full animate-float" style={{top: '80%', left: '20%'}}></div>
          <div className="absolute w-1 h-1 bg-amber-300/35 rounded-full animate-float-delayed" style={{top: '30%', left: '70%'}}></div>
        </div>

        <div className="mb-10 mx-auto text-center relative z-10">
          <div className="relative inline-block">
            <span className="text-4xl font-bold text-orange-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] tracking-wide select-none 
              hover:text-orange-400 transition-colors duration-300 cursor-default">Insta</span>
            <span className="text-4xl font-semibold text-orange-300 tracking-wide select-none 
              hover:text-orange-200 transition-colors duration-300 cursor-default">Connect</span>
            {/* Subtle underline animation */}
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent 
              scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
          </div>
          <p className="text-stone-400 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Connect instantly with friends worldwide
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
          {isState === "Sign Up" && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullname}
                onChange={(e) => handleFieldChange('fullname', e.target.value)}
                onBlur={() => handleFieldBlur('fullname')}
                className={`px-5 py-3.5 rounded-2xl glass text-stone-100 placeholder:text-stone-400
                transition-all duration-300 ease-out focus:outline-none glow-effect
                focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30 hover:scale-[1.01]
                hover:shadow-[0_0_20px_rgba(251,146,60,0.1)] w-full magnetic
                ${errors.fullname && touched.fullname 
                  ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/25' 
                  : 'border-white/10 hover:border-white/20'
                }`}
              />
              {errors.fullname && touched.fullname && (
                <div className="absolute -bottom-6 left-0 text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.fullname}
                </div>
              )}
              {!errors.fullname && touched.fullname && fullname && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              className={`px-5 py-3.5 rounded-2xl glass text-stone-100 placeholder:text-stone-400
              transition-all duration-300 ease-out focus:outline-none glow-effect
              focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30 hover:scale-[1.01]
              hover:shadow-[0_0_20px_rgba(251,146,60,0.1)] w-full magnetic
              ${errors.email && touched.email 
                ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/25' 
                : 'border-white/10 hover:border-white/20'
              }`}
            />
            {errors.email && touched.email && (
              <div className="absolute -bottom-6 left-0 text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.email}
              </div>
            )}
            {!errors.email && touched.email && email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              className={`px-5 py-3.5 pr-12 rounded-2xl glass text-stone-100 placeholder:text-stone-400
              transition-all duration-300 ease-out focus:outline-none glow-effect
              focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30 hover:scale-[1.01]
              hover:shadow-[0_0_20px_rgba(251,146,60,0.1)] w-full magnetic
              ${errors.password && touched.password 
                ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/25' 
                : 'border-white/10 hover:border-white/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {errors.password && touched.password && (
              <div className="absolute -bottom-6 left-0 text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.password}
              </div>
            )}
            {!errors.password && touched.password && password && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {isState === "Sign Up" && (
            <div className="relative">
              <textarea
                placeholder="Tell us about yourself..."
                required
                value={bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                onBlur={() => handleFieldBlur('bio')}
                rows={3}
                className={`px-5 py-3.5 rounded-2xl glass text-stone-100 placeholder:text-stone-400
                transition-all duration-300 ease-out focus:outline-none resize-none glow-effect
                focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30 hover:scale-[1.01]
                hover:shadow-[0_0_20px_rgba(251,146,60,0.1)] w-full magnetic
                ${errors.bio && touched.bio 
                  ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/25' 
                  : 'border-white/10 hover:border-white/20'
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
                <div className="absolute top-3 right-3 text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {isState === "Sign Up" && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-5 w-5 accent-amber-500 rounded-md transition-transform duration-150 ease-out motion-safe:active:scale-95"
              />
              <label htmlFor="terms" className="text-sm lg:text-[15px] text-stone-300">
                I agree to the <span className="text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors duration-150 ease-out">Terms and Conditions</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 w-full py-3.5 rounded-2xl relative overflow-hidden group/btn
            ${isLoading 
              ? 'bg-gradient-to-r from-stone-600 to-stone-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-400'
            }
            text-stone-950 font-semibold text-lg tracking-wide
            shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)]
            hover:shadow-[0_16px_40px_-12px_rgba(251,146,60,0.8)]
            transition-all duration-300 ease-out
            ${!isLoading && 'motion-safe:hover:translate-y-[-2px] motion-safe:hover:scale-[1.02]'}
            motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/10 before:to-transparent 
            ${!isLoading && 'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-stone-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isState === "Sign Up" ? "Creating Account..." : "Signing In..."}
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isState === "Sign Up" ? "Create Account" : "Log In"}
                <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>

          {isState === "Sign Up" ? (
            <p className="mt-4 text-center text-[15px] text-stone-400 transition-colors">
              Already have an account?{" "}
              <span onClick={() => setIsState("Login")} className="text-amber-400 hover:text-amber-300 cursor-pointer font-medium transition-colors duration-150 ease-out">
                Log In
              </span>
            </p>
          ) : (
            <p className="mt-4 text-center text-[15px] text-stone-400 transition-colors">
              Don’t have an account?{" "}
              <span onClick={() => setIsState("Sign Up")} className="text-amber-400 hover:text-amber-300 cursor-pointer font-medium transition-colors duration-150 ease-out">
                Sign Up
              </span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}


export default LoginPage;
