"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, Star, Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === "artisan") router.push("/dashboard");
      else if (user?.role === "admin") router.push("/admin");
      else router.push("/products");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[var(--cream)] via-[var(--off-white)] to-[var(--clay-light)] relative overflow-hidden">
      {/* Background craft pattern */}
      <div className="craft-pattern absolute inset-0 opacity-20 pointer-events-none" />

      {/* Left — Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-[var(--light-gray)]"
        >
          {/* Logo & Header */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--terracotta)] via-amber-600 to-[var(--brass)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg font-display">K</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-[var(--charcoal)] tracking-tight">KalaSetu</span>
              <span className="text-[10px] text-[var(--terracotta)] font-semibold block uppercase tracking-wider -mt-1">
                AI Artisan Bridge
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--terracotta)]/10 text-[var(--terracotta)] text-xs font-semibold mb-3">
            <Sparkles size={13} /> Welcome Back to the Studio
          </span>

          <h1 className="text-3xl font-display font-bold text-[var(--charcoal)] mb-2">
            Sign In to <span className="gradient-text">KalaSetu</span>
          </h1>
          <p className="text-sm text-[var(--warm-gray)] mb-8">
            Access your AI cataloguing workspace, buyer enquiries, and heritage store.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-[var(--error)] px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm rounded-xl"
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="name@kalasetu.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-sm rounded-xl"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] hover:text-[var(--charcoal)] transition-colors z-10 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--terracotta)]/20 disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign In to Studio"} <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--warm-gray)]">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-[var(--terracotta)] font-bold hover:underline">
              Create Account
            </Link>
          </p>

          {/* Quick Demo Credentials Selection */}
          <div className="mt-8 pt-6 border-t border-[var(--light-gray)]">
            <p className="text-xs font-bold text-[var(--charcoal)] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles size={14} className="text-[var(--terracotta)]" /> Instant Demo Quick-Fill:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("priya@kalasetu.com", "artisan123456")}
                className="p-2.5 text-left rounded-xl bg-[var(--cream)] hover:bg-[var(--clay-light)] border border-[var(--light-gray)] transition-colors group"
              >
                <span className="block text-xs font-bold text-[var(--charcoal)] group-hover:text-[var(--terracotta)]">🎨 Artisan</span>
                <span className="text-[10px] text-[var(--warm-gray)] block truncate">Priya Sharma</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("amit@buyer.com", "buyer123456")}
                className="p-2.5 text-left rounded-xl bg-[var(--cream)] hover:bg-[var(--clay-light)] border border-[var(--light-gray)] transition-colors group"
              >
                <span className="block text-xs font-bold text-[var(--charcoal)] group-hover:text-[var(--terracotta)]">🛍️ Buyer</span>
                <span className="text-[10px] text-[var(--warm-gray)] block truncate">Amit Patel</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("admin@kalasetu.com", "admin123456")}
                className="p-2.5 text-left rounded-xl bg-[var(--cream)] hover:bg-[var(--clay-light)] border border-[var(--light-gray)] transition-colors group"
              >
                <span className="block text-xs font-bold text-[var(--charcoal)] group-hover:text-[var(--terracotta)]">⚙️ Admin</span>
                <span className="text-[10px] text-[var(--warm-gray)] block truncate">KalaSetu Admin</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — Showcase Visual Hero Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--charcoal)] via-[#2E4057] to-[var(--terracotta)] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,123,90,0.3),transparent_60%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white text-center max-w-lg relative z-10 space-y-8"
        >
          <div className="relative inline-block">
            <div className="w-28 h-28 mx-auto rounded-3xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-2xl flex items-center justify-center text-5xl">
              🏺
            </div>
            <span className="absolute -top-2 -right-2 bg-[var(--terracotta)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              AI Powered
            </span>
          </div>

          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight mb-4 text-white">
              Where Ancient Indian Craft Meets Modern AI Intelligence
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-md mx-auto">
              Empowering India&apos;s master artisans with instant Computer Vision cataloguing, direct buyer messaging, and fair market transparency.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <ShieldCheck className="text-amber-400 mb-1.5" size={20} />
              <p className="font-bold text-xs">100% Verified Artisans</p>
              <p className="text-[10px] text-white/70">Authentic regional craftspeople</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles className="text-amber-400 mb-1.5" size={20} />
              <p className="font-bold text-xs">AI Smart Cataloguing</p>
              <p className="text-[10px] text-white/70">Instant vision title & story</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
