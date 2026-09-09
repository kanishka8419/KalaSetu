"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, User, LogOut, ChevronDown, MessageCircle, Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "artisan") return "/dashboard";
    if (user.role === "admin") return "/admin";
    return "/products";
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--terracotta)] to-[var(--brass)] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm font-display">K</span>
            </div>
            <span className="text-xl font-display font-bold text-[var(--charcoal)] group-hover:text-[var(--terracotta)] transition-colors">
              KalaSetu
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-[var(--warm-gray)] hover:text-[var(--terracotta)] transition-colors font-medium text-sm">
              Marketplace
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/favourites" className="text-[var(--warm-gray)] hover:text-[var(--terracotta)] transition-colors font-medium text-sm flex items-center gap-1.5">
                  <Heart size={15} className="text-red-500 fill-red-500/20" /> Favourites
                </Link>
                <Link href="/my-enquiries" className="text-[var(--warm-gray)] hover:text-[var(--terracotta)] transition-colors font-medium text-sm flex items-center gap-1">
                  <MessageCircle size={15} /> My Enquiries
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/products"
              className="p-2 rounded-lg hover:bg-[var(--cream)] transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-[var(--warm-gray)]" />
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--cream)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--terracotta)] to-[var(--clay)] flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--charcoal)]">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-[var(--warm-gray)]" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--light-gray)] py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-[var(--light-gray)]">
                        <p className="text-sm font-semibold text-[var(--charcoal)]">{user.full_name}</p>
                        <p className="text-xs text-[var(--warm-gray)] capitalize">{user.role}</p>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--cream)] transition-colors"
                      >
                        <User size={16} /> Dashboard
                      </Link>
                      <Link
                        href="/favourites"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--cream)] transition-colors"
                      >
                        <Heart size={16} className="text-red-500 fill-red-500/20" /> My Favourites
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Join as Artisan
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--cream)]"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[var(--light-gray)]"
          >
            <div className="px-4 py-4 space-y-2 bg-white">
              <Link href="/products" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-[var(--cream)] font-medium">
                Marketplace
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-[var(--cream)] font-medium">
                    Dashboard
                  </Link>
                  <Link href="/favourites" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-[var(--cream)] font-medium flex items-center gap-2">
                    <Heart size={16} className="text-red-500 fill-red-500/20" /> Favourites
                  </Link>
                  <button onClick={handleSignOut} className="block py-2.5 px-3 rounded-lg hover:bg-red-50 text-[var(--error)] font-medium w-full text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">
                    Join
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
