"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, ArrowRight, ShoppingBag, Lock, LogIn } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import type { Product } from "@/types";

export default function FavouritesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getAccountFavKey = () => {
    if (!user) return "kalasetu_favorites_guest";
    return `kalasetu_favorites_${user.id || user.email}`;
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const accountKey = getAccountFavKey();
      const savedRaw = localStorage.getItem(accountKey);
      let savedList: Product[] = [];
      if (savedRaw) {
        try {
          savedList = JSON.parse(savedRaw);
        } catch {}
      }
      setFavoriteProducts(savedList);
    } catch {
      setFavoriteProducts([]);
    }
    setLoading(false);
  };

  const removeFavorite = (productId: string) => {
    const updated = favoriteProducts.filter((p) => p.id !== productId);
    setFavoriteProducts(updated);
    const accountKey = getAccountFavKey();
    localStorage.setItem(accountKey, JSON.stringify(updated));
    if (user) {
      localStorage.removeItem(`fav_${user.id}_${productId}`);
    }
  };

  const getImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0)
      return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
    const img = product.images[0];
    return typeof img === "string" ? img : (img as any).url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-[var(--light-gray)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-red-50 text-red-500">
                <Heart size={22} className="fill-red-500" />
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)]">
                My Saved Favourites
              </h1>
            </div>
            <p className="text-sm text-[var(--warm-gray)]">
              Your personal collection of handcrafted Indian artisan pieces.
            </p>
          </div>
          <span className="badge badge-craft text-sm px-4 py-2 self-start sm:self-auto">
            {favoriteProducts.length} Saved {favoriteProducts.length === 1 ? "Craft" : "Crafts"}
          </span>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="text-center py-20 card max-w-md mx-auto p-10 space-y-4 my-8">
            <div className="w-16 h-16 bg-amber-50 text-[var(--terracotta)] rounded-full flex items-center justify-center mx-auto">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--charcoal)]">
              Sign In to Access Favourites
            </h2>
            <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
              Favourites are saved specifically for each account. Please sign in to view your saved artisan creations.
            </p>
            <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6 text-sm w-full">
              <LogIn size={16} /> Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="aspect-square animate-shimmer rounded-xl mb-3" />
                <div className="h-4 w-3/4 animate-shimmer rounded mb-2" />
                <div className="h-4 w-1/2 animate-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square card-image-wrapper">
                    <img
                      src={getImageUrl(product)}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove from favourites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="badge badge-craft text-[10px] uppercase mb-2 block w-fit">
                      {product.category}
                    </span>
                    <h3 className="font-display font-semibold text-sm line-clamp-2 text-[var(--charcoal)] mb-1 group-hover:text-[var(--terracotta)] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-[var(--terracotta)] font-bold text-base">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    {product.artisan_name && (
                      <p className="text-xs text-[var(--warm-gray)] mt-1">
                        by {product.artisan_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="btn-primary flex-1 py-2 text-xs text-center flex items-center justify-center gap-1"
                  >
                    View Piece <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card max-w-xl mx-auto p-10">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={36} />
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--charcoal)] mb-2">
              No Favourites Saved Yet
            </h2>
            <p className="text-sm text-[var(--warm-gray)] mb-6 leading-relaxed">
              Explore our marketplace, discover authentic handmade pottery, textiles, jewelry and woodcraft, and click the ❤️ button to save them here!
            </p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-sm">
              <ShoppingBag size={16} /> Explore Marketplace
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
