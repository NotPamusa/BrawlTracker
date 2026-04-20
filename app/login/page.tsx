"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.refresh();
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.refresh();
        router.push("/");
      }
    }
    
    setLoading(false);
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <main className="flex flex-col flex-1 relative z-10 items-center justify-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold leading-tight tracking-wide text-[var(--brawl-text)] uppercase">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-[var(--brawl-text-muted)] mt-2 uppercase tracking-widest font-bold">
            {isSignUp ? "Join BrawlToMax today" : "Sign in to your account"}
          </p>
        </div>

        {/* Card Panel */}
        <div className="inset-panel p-6 sm:p-8 chamfer-md bg-[var(--brawl-bg-card)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                Email Address
              </label>
              <div className="chamfer-input-wrap chamfer-sm w-full">
                <div className="chamfer-input-bg chamfer-sm flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="chamfer-input-core py-3 px-4 text-sm font-semibold placeholder:text-[var(--brawl-text-dim)]"
                  />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                Password
              </label>
              <div className="chamfer-input-wrap chamfer-sm w-full">
                <div className="chamfer-input-bg chamfer-sm flex items-center pr-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••••••"
                    className="chamfer-input-core py-3 px-4 text-sm font-bold placeholder:text-[var(--brawl-text-dim)] tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--brawl-text-dim)] hover:text-[var(--brawl-cyan)] transition-colors p-1"
                  >
                    {showPassword ? < EyeIcon /> : < EyeOffIcon />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password Input (Sign Up Only) */}
            {isSignUp && (
              <div className="flex flex-col gap-2 animate-fade-in-up">
                <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-wider font-bold">
                  Confirm Password
                </label>
                <div className="chamfer-input-wrap chamfer-sm w-full">
                  <div className="chamfer-input-bg chamfer-sm flex items-center pr-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••••••••••"
                      className="chamfer-input-core py-3 px-4 text-sm font-bold placeholder:text-[var(--brawl-text-dim)] tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[var(--brawl-text-dim)] hover:text-[var(--brawl-cyan)] transition-colors p-1"
                    >
                      {showConfirmPassword ? < EyeIcon /> : < EyeOffIcon />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-[var(--brawl-red)] font-bold uppercase tracking-wider text-center">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <div className="mt-4 flex justify-center w-full">
              <div className="hex-btn-wrap w-full flex">
                <button
                  type="submit"
                  disabled={loading}
                  className="hex-btn w-full !clip-path-none chamfer-md"
                  style={{
                    clipPath: "polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)"
                  }}
                >
                  <div
                    className="hex-btn-inner w-full py-3"
                    style={{
                      clipPath: "polygon(13px 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 13px 100%, 0% 50%)"
                    }}
                  >
                    {loading ? "LOADING..." : isSignUp ? "SIGN UP" : "LOG IN"}
                  </div>
                </button>
              </div>
            </div>
          </form>

          {/* Toggle Button */}
          <div className="mt-6 pt-6 border-t border-[var(--brawl-border-dim)] text-center">
            <p className="text-xs text-[var(--brawl-text-muted)] mb-3 uppercase tracking-wider font-bold">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="chamfer-btn-secondary chamfer-sm w-full"
              type="button"
            >
              <div className="btn-inner chamfer-sm !py-2 !text-xs">
                {isSignUp ? "SWITCH TO LOGIN" : "CREATE ACCOUNT"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
