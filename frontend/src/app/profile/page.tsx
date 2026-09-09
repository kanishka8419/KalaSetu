"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Save } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then((data) => setProfile(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.updateProfile({
        full_name: profile.full_name,
        bio: profile.bio,
        craft_specialty: profile.craft_specialty,
        address: profile.address,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card p-8 space-y-4">
            {Array(5).fill(null).map((_, i) => <div key={i} className="h-12 animate-shimmer rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display font-bold text-[var(--charcoal)] mb-8">Edit Profile</h1>

        {profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--terracotta)] to-[var(--clay)] flex items-center justify-center">
                <span className="text-white text-2xl font-bold font-display">
                  {profile.full_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">{profile.full_name}</h2>
                <p className="text-sm text-[var(--warm-gray)] capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Full Name</label>
                <input
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Email</label>
                <input value={profile.email || ""} className="input-field bg-[var(--cream)]" disabled />
              </div>

              {user?.role === "artisan" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Bio</label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="input-field resize-none h-24"
                      placeholder="Tell buyers about your craft journey..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Craft Specialty</label>
                    <select
                      value={profile.craft_specialty || ""}
                      onChange={(e) => setProfile({ ...profile, craft_specialty: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      {["pottery","textiles","jewelry","woodwork","metalwork","leather","painting","glass","stone_carving","bamboo_craft"].map((c) => (
                        <option key={c} value={c}>{c.replace("_"," ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5 flex items-center gap-1">
                      <MapPin size={14} /> Location / Address
                    </label>
                    <input
                      value={profile.address || ""}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Jaipur, Rajasthan"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? "Saving..." : saved ? (
                  <><span className="text-green-200">✓</span> Saved!</>
                ) : (
                  <><Save size={18} /> Save Profile</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
