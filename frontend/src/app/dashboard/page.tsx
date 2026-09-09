"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Package, MessageCircle, BarChart3, User, Plus, Eye, TrendingUp, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import type { Product } from "@/types";

export default function ArtisanDashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete section state
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, productsData] = await Promise.all([
          api.getMyAnalytics(),
          api.getMyProducts({ page: 1 }),
        ]);
        setAnalytics(analyticsData);
        setProducts(productsData.products);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(deleteProductTarget.id);
      setProducts(products.filter((p) => p.id !== deleteProductTarget.id));
      setDeleteNotification(`Successfully deleted "${deleteProductTarget.title}"`);
      setTimeout(() => setDeleteNotification(null), 4000);
    } catch {
      alert("Failed to delete product. Please try again.");
    }
    setIsDeleting(false);
    setDeleteProductTarget(null);
  };

  const getImageUrl = (product: Product) => {
    if (!product.images?.length) return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80";
    const img = product.images[0];
    return typeof img === "string" ? img : (img as any).url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80";
  };

  const stats = [
    { label: "Total Products", value: products.length || analytics?.total_products || 0, icon: <Package size={20} />, color: "var(--terracotta)" },
    { label: "Total Views", value: analytics?.total_views || 0, icon: <Eye size={20} />, color: "var(--indigo)" },
    { label: "Enquiries", value: analytics?.total_enquiries || 0, icon: <MessageCircle size={20} />, color: "var(--brass)" },
    { label: "Rating", value: analytics?.rating || "4.5", icon: <TrendingUp size={20} />, color: "var(--success)" },
  ];

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deletion Notification Toast */}
        <AnimatePresence>
          {deleteNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-600" />
                <span className="text-sm font-semibold">{deleteNotification}</span>
              </div>
              <button onClick={() => setDeleteNotification(null)} className="text-xs text-emerald-700 hover:underline">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)]">
              Welcome back, {user?.full_name?.split(" ")[0] || "Artisan"} 👋
            </h1>
            <p className="text-[var(--warm-gray)]">Here&apos;s your craft studio at a glance</p>
          </div>
          <Link href="/upload" className="btn-primary flex items-center gap-2 self-start">
            <Plus size={18} /> Upload New Craft
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--charcoal)]">{stat.value}</p>
              <p className="text-xs text-[var(--warm-gray)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions & AI Insights */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--cream)] transition-colors group">
                  <div className="p-2 rounded-lg bg-[var(--terracotta)]/10 text-[var(--terracotta)]"><Upload size={18} /></div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-[var(--terracotta)] transition-colors">Upload & AI Catalogue</p>
                    <p className="text-xs text-[var(--warm-gray)]">Let AI create your product listing</p>
                  </div>
                </Link>
                <Link href="/my-products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--cream)] transition-colors group">
                  <div className="p-2 rounded-lg bg-[var(--indigo)]/10 text-[var(--indigo)]"><Package size={18} /></div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-[var(--terracotta)] transition-colors">My Products & Catalogue</p>
                    <p className="text-xs text-[var(--warm-gray)]">Manage and edit your listings</p>
                  </div>
                </Link>
                <Link href="/enquiries" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--cream)] transition-colors group">
                  <div className="p-2 rounded-lg bg-[var(--brass)]/10 text-[var(--brass)]"><MessageCircle size={18} /></div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-[var(--terracotta)] transition-colors">Enquiries</p>
                    <p className="text-xs text-[var(--warm-gray)]">View buyer messages</p>
                  </div>
                </Link>
                <a href="#delete-section" className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors group border border-red-100">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600"><Trash2 size={18} /></div>
                  <div>
                    <p className="font-medium text-sm text-red-700 group-hover:text-red-800 transition-colors">Delete Crafts</p>
                    <p className="text-xs text-[var(--warm-gray)]">Remove crafts from marketplace</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Artisan AI Insights Panel */}
            <div className="card p-5 bg-gradient-to-br from-amber-500/10 via-[var(--terracotta)]/5 to-indigo-500/10 border border-[var(--terracotta)]/20">
              <h4 className="font-display font-bold text-sm text-[var(--charcoal)] mb-3 flex items-center gap-1.5">
                <BarChart3 size={16} className="text-[var(--terracotta)]" /> Artisan AI Insights Loop
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[var(--light-gray)]">
                  <span className="text-[var(--warm-gray)]">Response Rate:</span>
                  <strong className="text-emerald-700 font-bold text-sm">100% Active</strong>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[var(--light-gray)]">
                  <span className="text-[var(--warm-gray)]">AI Cataloging Speed:</span>
                  <strong className="text-[var(--terracotta)] font-bold text-sm">Instant (4 steps)</strong>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[var(--light-gray)]">
                  <span className="text-[var(--warm-gray)]">FAISS Vector Search Status:</span>
                  <strong className="text-indigo-700 font-bold text-sm">Active & Indexed</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Products & Delete Management Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6" id="delete-section">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--light-gray)] pb-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--charcoal)] flex items-center gap-2">
                    <Trash2 size={20} className="text-[var(--terracotta)]" /> Studio Craft & Delete Section
                  </h3>
                  <p className="text-xs text-[var(--warm-gray)]">Manage, review, or delete unwanted craft listings from your studio.</p>
                </div>
                <Link href="/my-products" className="text-sm text-[var(--terracotta)] hover:underline font-semibold">
                  Manage All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array(4).fill(null).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-shimmer p-3 rounded-lg h-16" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[var(--off-white)] border border-[var(--light-gray)] hover:border-[var(--clay)] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={getImageUrl(product)} alt="" className="w-14 h-14 rounded-lg object-cover border shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="badge badge-craft text-[10px] uppercase">{product.category}</span>
                            <span className={`badge text-[10px] ${
                              product.status === "published" ? "badge-status-published" : "badge-status-draft"
                            }`}>
                              {product.status}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-[var(--charcoal)] truncate">{product.title}</p>
                          <p className="text-xs text-[var(--terracotta)] font-bold">₹{product.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>

                      {/* Delete Action Button */}
                      <button
                        onClick={() => setDeleteProductTarget(product)}
                        className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-200 shrink-0"
                        title="Delete this craft listing"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <span className="text-4xl block mb-2">🎨</span>
                  <p className="text-[var(--warm-gray)] text-sm">No studio products available to delete.</p>
                  <Link href="/upload" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                    <Upload size={16} /> Upload New Craft
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--light-gray)] text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <h3 className="font-display font-bold text-xl text-[var(--charcoal)]">Delete Craft Listing?</h3>
            <p className="text-sm text-[var(--warm-gray)]">
              Are you sure you want to delete <strong className="text-[var(--charcoal)]">&ldquo;{deleteProductTarget.title}&rdquo;</strong>? This action will remove the craft from marketplace search.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold flex-1 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Yes, Delete Craft"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
