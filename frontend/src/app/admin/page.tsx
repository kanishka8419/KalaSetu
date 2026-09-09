"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Eye, MessageCircle, TrendingUp, Shield, CheckCircle, XCircle, BarChart3, Activity } from "lucide-react";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import type { AdminAnalytics } from "@/types";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [moderation, setModeration] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "moderation">("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [a, u, m] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAdminUsers({ page: 1 }),
          api.getModerationQueue(),
        ]);
        setAnalytics(a);
        setUsers((u as any).users || []);
        setModeration(m.items || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.updateUserStatus(userId, isActive);
      setUsers(users.map((u) => u.id === userId ? { ...u, is_active: isActive } : u));
    } catch {}
  };

  const handleModerate = async (productId: string, action: string) => {
    try {
      await api.moderateProduct(productId, action);
      setModeration(moderation.filter((m) => m.id !== productId));
    } catch {}
  };

  const stats = analytics ? [
    { label: "Total Users", value: analytics.total_users, icon: <Users size={20} />, color: "#2E4057" },
    { label: "Artisans", value: analytics.total_artisans, icon: <Shield size={20} />, color: "#C75B39" },
    { label: "Products", value: analytics.total_products, icon: <Package size={20} />, color: "#B8860B" },
    { label: "Total Views", value: analytics.total_views, icon: <Eye size={20} />, color: "#2D6A4F" },
    { label: "Enquiries", value: analytics.total_enquiries, icon: <MessageCircle size={20} />, color: "#6B6B7B" },
    { label: "Published", value: analytics.published_products, icon: <CheckCircle size={20} />, color: "#3D5A80" },
  ] : [];

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)]">Admin Dashboard</h1>
          <p className="text-[var(--warm-gray)]">Platform overview and management</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 mb-8 w-fit border border-[var(--light-gray)]">
          {(["overview", "users", "moderation"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === t ? "bg-[var(--indigo)] text-white" : "text-[var(--warm-gray)] hover:text-[var(--charcoal)]"
              }`}
            >{t}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
                  <div className="p-2 rounded-lg w-fit mb-2" style={{ backgroundColor: `${stat.color}15` }}>
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                  </div>
                  <p className="text-xl font-bold text-[var(--charcoal)]">{stat.value}</p>
                  <p className="text-xs text-[var(--warm-gray)]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Category Breakdown + AI Health */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><BarChart3 size={18} /> Category Breakdown</h3>
                {analytics?.category_breakdown && Object.entries(analytics.category_breakdown).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.category_breakdown).map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm capitalize w-28 truncate">{cat.replace("_", " ")}</span>
                        <div className="flex-1 bg-[var(--cream)] rounded-full h-2.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--terracotta)] to-[var(--brass)]"
                            style={{ width: `${Math.min(100, ((count as number) / Math.max(...Object.values(analytics.category_breakdown) as number[])) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--charcoal)] w-8 text-right">{count as number}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[var(--warm-gray)]">No data yet</p>}
              </div>

              <div className="card p-6">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Activity size={18} /> AI Pipeline Health</h3>
                {analytics?.ai_pipeline_health && (
                  <div className="space-y-3">
                    {Object.entries(analytics.ai_pipeline_health).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-[var(--cream)] rounded-lg">
                        <span className="text-sm font-medium capitalize">{service.replace("_", " ")}</span>
                        <span className={`badge text-xs ${status.includes("operational") ? "badge-status-published" : "badge-status-draft"}`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--cream)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--warm-gray)] uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--warm-gray)] uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--warm-gray)] uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--warm-gray)] uppercase">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--warm-gray)] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--light-gray)]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--cream)]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--terracotta)] to-[var(--clay)] flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{user.full_name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.full_name}</p>
                              <p className="text-xs text-[var(--warm-gray)]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="badge badge-craft text-xs capitalize">{user.role}</span></td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${user.is_active ? "badge-status-published" : "bg-red-100 text-red-700"}`}>
                            {user.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--warm-gray)]">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUserStatus(user.id, !user.is_active)}
                            className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                              user.is_active
                                ? "text-[var(--error)] hover:bg-red-50"
                                : "text-[var(--success)] hover:bg-green-50"
                            }`}
                          >
                            {user.is_active ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && <div className="text-center py-12 text-[var(--warm-gray)]">No users found</div>}
            </div>
          </motion.div>
        )}

        {/* Moderation Queue */}
        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {moderation.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {moderation.map((item) => (
                  <div key={item.id} className="card p-5">
                    <div className="flex gap-4">
                      {item.images?.[0] && (
                        <img
                          src={typeof item.images[0] === "string" ? item.images[0] : item.images[0].url}
                          alt="" className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-[var(--warm-gray)] mb-1">by {item.artisan_name}</p>
                        <span className={`badge text-xs ${item.status === "flagged" ? "bg-red-100 text-red-700" : "badge-status-draft"}`}>{item.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleModerate(item.id, "approve")} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => handleModerate(item.id, "reject")} className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1 text-[var(--error)] border-[var(--error)]">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-16">
                <CheckCircle size={48} className="mx-auto text-[var(--success)] mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-[var(--warm-gray)] text-sm">No products pending moderation.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
