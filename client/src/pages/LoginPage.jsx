import React, { useState } from 'react'
import assets from '../assets/assets'

function LoginPage() {
  const [isState, setIsState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [bio, setBio] = useState("");
  const onSubmitHandler = (e) => {
    e.preventDefault();
    setIsSubmit(true);
    if(isState === "Sign Up"){
      setIsSubmit(true)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
        <img
          src={assets.logo_big}
          alt="logo"
          className="mb-8 mx-auto max-w-[140px] hover:scale-105 transition-transform duration-300"
        />

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          {isState === "Sign Up" && !isSubmit && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-indigo-500 placeholder-gray-400 text-gray-100"
            />
          )}

          {!isSubmit && (
            <>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-indigo-500 placeholder-gray-400 text-gray-100"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-indigo-500 placeholder-gray-400 text-gray-100"
              />
            </>
          )}
           {!isSubmit && isState === "Sign Up" && (
            <>
              <input
                type="text"
                placeholder="Bio"
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-indigo-500 placeholder-gray-400 text-gray-100"
              />
            </>
          )}

          {!isSubmit && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-4 w-4 accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the <span className="text-indigo-400 hover:text-indigo-300">Terms and Conditions</span>
              </label>
            </div>
          )}

         
          {!isSubmit && (
            <button
              type="submit"
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              {isState === "Sign Up" && !isSubmit ? "Create Account" : "Log In"}
            </button>
          )}

          {isState === "Sign Up" && !isSubmit && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <span
                onClick={() => setIsState("Login")}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold"
              >
                Log In
              </span>
            </p>
          )}

          {isState === "Login" && !isSubmit && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Don’t have an account?{" "}
              <span
                onClick={() => setIsState("Sign Up")}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold"
              >
                Sign Up
              </span>
            </p>
          )}
          
        </form>
      </div>
    </div>
  )
}

export default LoginPage
