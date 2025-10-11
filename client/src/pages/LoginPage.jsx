import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

function LoginPage() {
  const [isState, setIsState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const { login } = useContext(AuthContext);

  // Cursor spotlight handler (no content change, just interactivity)
  const onMouseMove = (e) => {
    const root = e.currentTarget;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (isState === "Login") {
      login("login", { email, password });
    } else {
      login("signup", { fullname, email, password, bio });
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

      <div className="w-full max-w-2xl rounded-3xl border border-stone-800/80 bg-stone-900/75 backdrop-blur-xl
        shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] p-10 lg:p-14
        transition-shadow duration-300 ease-out motion-safe:hover:shadow-[0_36px_100px_-34px_rgba(0,0,0,0.70)]"
      >
  <div className="mb-10 mx-auto text-center">
          <span className="text-4xl font-bold text-orange-500 drop-shadow-[0_8px_22px_rgba(251,146,60,0.35)] tracking-wide select-none">Insta</span>
          <span className="text-4xl font-semibold text-orange-300 tracking-wide select-none">Connect</span>
        </div>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
          {isState === "Sign Up" && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
              shadow-inner transition-all duration-200 ease-out focus:outline-none
              focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 motion-safe:focus:scale-[1.01]"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
            shadow-inner transition-all duration-200 ease-out focus:outline-none
            focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 motion-safe:focus:scale-[1.01]"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
            shadow-inner transition-all duration-200 ease-out focus:outline-none
            focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 motion-safe:focus:scale-[1.01]"
          />

          {isState === "Sign Up" && (
            <input
              type="text"
              placeholder="Bio"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="px-5 py-3.5 rounded-2xl bg-stone-900/80 border border-stone-700/70 text-stone-100 placeholder:text-stone-400
              shadow-inner transition-all duration-200 ease-out focus:outline-none
              focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 motion-safe:focus:scale-[1.01]"
            />
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
            className="mt-2 w-full py-3.5 rounded-2xl
            bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500
            hover:from-amber-500 hover:via-orange-500 hover:to-amber-400
            text-stone-950 font-semibold text-lg tracking-wide
            shadow-[0_12px_34px_-12px_rgba(251,146,60,0.6)]
            transition-all duration-200 ease-out
            motion-safe:hover:translate-y-[-1px]
            motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
          >
            {isState === "Sign Up" ? "Create Account" : "Log In"}
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
