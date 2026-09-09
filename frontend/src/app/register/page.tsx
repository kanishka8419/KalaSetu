"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, User, Mail, Lock, ArrowRight, Palette, ShoppingBag, CheckCircle2, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "artisan" as "artisan" | "buyer",
    craft_specialty: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      if (form.role === "artisan") router.push("/dashboard");
      else router.push("/products");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[var(--cream)] via-[var(--off-white)] to-[var(--clay-light)] relative overflow-hidden">
      {/* Craft background overlay */}
      <div className="craft-pattern absolute inset-0 opacity-20 pointer-events-none" />

      {/* Left — Traditional Aesthetic Visual Hero Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#8B2613] via-[#1A1A2E] to-[#B8860B] items-center justify-center p-12 relative overflow-hidden">
        {/* Mandana / Traditional Craft Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,240,232,0.12),transparent_70%)] pointer-events-none" />
        <div className="craft-pattern absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-white text-center max-w-lg relative z-10 space-y-6 bg-black/20 backdrop-blur-md p-8 rounded-3xl border-2 border-[var(--brass)]/40 shadow-2xl"
        >
          {/* Traditional Heritage Seal Header */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brass)]/20 border border-[var(--brass)] text-amber-300 text-xs font-bold uppercase tracking-widest">
            <span>✨</span> <span>कला और हस्तशिल्प धरोहर</span> <span>✨</span>
          </div>

          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight mb-3 text-amber-100">
              Preserving Ancient Indian Artisanship with Modern Intelligence
            </h2>
            <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Connecting Jaipur Potters, Varanasi Weavers, Mysore Sandalwood Carvers, and Moradabad Artisans directly to global craft enthusiasts.
            </p>
          </div>

          {/* Traditional Craft Visual Showcase Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { title: "Jaipur Blue Pottery", img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80", tag: "राजस्थान" },
              { title: "Banarasi Silk Textiles", img: "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=300&q=80", tag: "वाराणसी" },
              { title: "Moradabad Brassware", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80", tag: "उत्तर प्रदेश" },
              { title: "Sandalwood Carvings", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80", tag: "कर्नाटक" },
            ].map((craft, i) => (
              <motion.div
                key={craft.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="relative rounded-2xl overflow-hidden border border-amber-500/30 group shadow-md"
              >
                <img src={craft.img} alt={craft.title} className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end text-left">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{craft.tag}</span>
                  <p className="text-xs font-bold text-white truncate">{craft.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-amber-200/90">
            <Shield size={16} className="text-amber-400" /> 100% Authentic Indian Craft Guarantee
          </div>
        </motion.div>
      </div>

      {/* Right — Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-[var(--light-gray)]"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
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
            <Sparkles size={13} /> Start Your Journey Today
          </span>

          <h1 className="text-3xl font-display font-bold text-[var(--charcoal)] mb-1">
            Create Your <span className="gradient-text">Account</span>
          </h1>
          <p className="text-sm text-[var(--warm-gray)] mb-6">
            Join thousands of artisans and buyers on India&apos;s leading craft platform.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector Card */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-2">
                I want to join as...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "artisan" })}
                  className={`p-3.5 rounded-2xl border-2 font-medium text-xs flex flex-col items-center gap-1.5 transition-all ${
                    form.role === "artisan"
                      ? "border-[var(--terracotta)] bg-[var(--terracotta)]/10 text-[var(--terracotta)] shadow-md"
                      : "border-[var(--light-gray)] text-[var(--warm-gray)] hover:border-[var(--clay)] bg-white"
                  }`}
                >
                  <Palette size={20} className={form.role === "artisan" ? "text-[var(--terracotta)]" : "text-[var(--warm-gray)]"} />
                  <span className="font-bold">Artisan / Seller</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "buyer" })}
                  className={`p-3.5 rounded-2xl border-2 font-medium text-xs flex flex-col items-center gap-1.5 transition-all ${
                    form.role === "buyer"
                      ? "border-[var(--terracotta)] bg-[var(--terracotta)]/10 text-[var(--terracotta)] shadow-md"
                      : "border-[var(--light-gray)] text-[var(--warm-gray)] hover:border-[var(--clay)] bg-white"
                  }`}
                >
                  <ShoppingBag size={20} className={form.role === "buyer" ? "text-[var(--terracotta)]" : "text-[var(--warm-gray)]"} />
                  <span className="font-bold">Craft Buyer</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] pointer-events-none z-10" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-field text-sm rounded-xl"
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] pointer-events-none z-10" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field text-sm rounded-xl"
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="you@example.com"
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field text-sm rounded-xl"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  placeholder="Min 8 characters"
                  minLength={8}
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

            {form.role === "artisan" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                    Craft Specialty
                  </label>
                  <select
                    value={form.craft_specialty}
                    onChange={(e) => setForm({ ...form, craft_specialty: e.target.value })}
                    className="input-field text-sm rounded-xl capitalize"
                  >
                    <option value="">Select primary craft...</option>
                    <option value="pottery">Pottery & Ceramics</option>
                    <option value="textiles">Textiles & Handloom Weaving</option>
                    <option value="jewelry">Jewelry & Filigree</option>
                    <option value="woodwork">Woodwork & Sandalwood Carving</option>
                    <option value="metalwork">Brass & Metalcraft</option>
                    <option value="painting">Tanjore & Heritage Painting</option>
                    <option value="leather">Leather Craft</option>
                    <option value="glass">Firozabad Glass</option>
                    <option value="stone_carving">Stone Carving</option>
                    <option value="bamboo_craft">Bamboo Craft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] mb-1.5">
                    Short Bio / Craft Heritage <span className="text-[var(--warm-gray)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input-field resize-none h-20 text-sm rounded-xl"
                    placeholder="Tell buyers about your craft tradition and region..."
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--terracotta)]/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--warm-gray)]">
            Already registered?{" "}
            <Link href="/login" className="text-[var(--terracotta)] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
