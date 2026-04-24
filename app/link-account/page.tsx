"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { startVerification, checkVerification, getProfile } from "@/app/actions";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

function LinkAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTag = searchParams.get("tag") || "";
  
  const [tag, setTag] = useState(initialTag);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'verified' | 'error'>('idle');
  const [verificationIcon, setVerificationIcon] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login?returnTo=/link-account");
      }
    });

    getProfile().then(profile => {
      if (profile?.verification_icon && profile.verification_expires_at) {
        const expires = new Date(profile.verification_expires_at).getTime();
        const now = new Date().getTime();
        if (expires > now) {
          setTag(profile.player_tag || "");
          setVerificationIcon(profile.verification_icon);
          setStatus('pending');
          setTimeLeft(Math.floor((expires - now) / 1000));
        }
      }
    });
  }, [router]);

  useEffect(() => {
    if (status === 'pending' && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setStatus('idle');
      setVerificationIcon(null);
      setError("Verification expired. Please try again.");
    }
  }, [status, timeLeft]);

  const handleStart = async () => {
    if (!tag) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await startVerification(tag);
      if (res.status === 'verified') {
        setStatus('verified');
        setTimeout(() => router.push('/profile'), 2000);
      } else {
        setVerificationIcon(res.iconId ?? null);
        setStatus('pending');
        const expires = new Date(res.expiresAt!).getTime();
        setTimeLeft(Math.floor((expires - Date.now()) / 1000));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkVerification();
      if (res.status === 'success') {
        setStatus('verified');
        setTimeout(() => router.push('/profile'), 2000);
      } else {
        setMessage(res.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex flex-col flex-1 items-center justify-center pt-24 pb-16 px-4 sm:px-6 relative z-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-[var(--brawl-text)] uppercase tracking-wide mb-8 text-center">
          Link Brawl Stars Account
        </h1>

        <div className="bg-[var(--brawl-border)] chamfer-md p-[2px] shadow-lg">
          <div className="p-8 chamfer-md bg-[var(--brawl-bg-card)]">
            
            {status === 'idle' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--brawl-text-muted)] uppercase tracking-widest font-bold block">
                    Player Tag
                  </label>
                  <div className="flex gap-2">
                    <div className="chamfer-input-wrap chamfer-sm flex-1">
                      <div className="chamfer-input-bg chamfer-sm flex items-center p-1">
                        <span className="pl-3 text-[var(--brawl-text-dim)] font-bold">#</span>
                        <input
                          type="text"
                          value={tag.replace('#', '')}
                          onChange={(e) => setTag(e.target.value.toUpperCase())}
                          placeholder="P92LRCQJ"
                          className="chamfer-input-core py-3 px-1 text-lg font-bold tracking-widest"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleStart}
                      disabled={loading || !tag}
                      className="chamfer-btn-primary chamfer-sm disabled:opacity-50 shrink-0"
                    >
                      <div className="btn-inner chamfer-sm !py-0 !px-6 h-full text-sm">
                        {loading ? '...' : 'LINK'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'pending' && (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <p className="text-sm text-[var(--brawl-text-muted)] uppercase tracking-wider mb-4 font-bold">
                    Verification required
                  </p>
                  <p className="text-lg font-bold text-white mb-6">
                    Set this as your profile icon in Brawl Stars:
                  </p>
                  
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 p-1 bg-[var(--brawl-cyan)] chamfer-sm">
                      <div className="w-full h-full bg-black chamfer-sm overflow-hidden relative">
                        <Image 
                          src={`/profile_pictures/pfp_${verificationIcon}.png`}
                          alt="Verification Icon"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--brawl-cyan)] font-bold uppercase tracking-widest mb-2">
                    Time remaining: {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                  </p>
                </div>

                <button 
                  onClick={handleCheck}
                  disabled={loading}
                  className="chamfer-btn-primary chamfer-sm w-full"
                >
                  <div className="btn-inner chamfer-sm py-4">
                    {loading ? 'CHECKING...' : 'DONE'}
                  </div>
                </button>

                {message && (
                  <p className="text-sm text-[var(--brawl-yellow)] font-bold animate-pulse">
                    {message}
                  </p>
                )}
              </div>
            )}

            {status === 'verified' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--brawl-green)]/20 text-[var(--brawl-green)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--brawl-green)] uppercase">
                  VERIFIED!
                </h2>
                <p className="text-[var(--brawl-text-muted)]">
                  Your account has been linked successfully. Redirecting...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-[var(--brawl-red)]/10 border border-[var(--brawl-red)]/30 rounded text-[var(--brawl-red)] text-sm font-bold text-center uppercase tracking-wider">
                {error}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--brawl-text-dim)] font-bold">LOADING...</div>}>
      <LinkAccountContent />
    </Suspense>
  );
}
