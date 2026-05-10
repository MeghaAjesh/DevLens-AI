"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const gradientBg = {
  background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  minHeight: "100vh",
};
const glassmorphism = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.10)",
};
const accentCoral = "#FF6B6B";
const accentMint = "#4ECDC4";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleEmailSignIn(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message ?? "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err.message ?? "Google sign in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <div style={gradientBg} className="flex items-center justify-center px-4 py-16 font-sans">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ width: 500, height: 500, top: "-10%", left: "-10%",
            background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)", animationDuration: "6s" }} />
        <div className="absolute rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ width: 400, height: 400, bottom: "-10%", right: "-5%",
            background: "radial-gradient(circle, #4ECDC4 0%, transparent 70%)", animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo textClassName="text-2xl" iconSize={36} />
          <h1 className="mt-6 text-3xl font-extrabold text-white">Welcome back</h1>
          <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={glassmorphism}>

          {/* Google button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {googleLoading
              ? <Loader2 size={18} className="animate-spin" />
              : <svg width="18" height="18" viewBox="0 0 24 24"><path fill={accentMint} d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>}
            {googleLoading ? "Redirecting…" : "Sign in with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-xs" style={{ color: "#64748b" }}>or continue with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#fca5a5" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" color={accentCoral} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: accentMint }}>
                Email
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Mail size={16} color="#64748b" className="shrink-0" />
                <input
                  id="email-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: accentMint }}>
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Lock size={16} color="#64748b" className="shrink-0" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  {showPassword ? <EyeOff size={15} color="white" /> : <Eye size={15} color="white" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="signin-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 24px rgba(255,107,107,0.4)` }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-sm" style={{ color: "#64748b" }}>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold hover:underline transition-colors" style={{ color: accentMint }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
