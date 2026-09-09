"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Star, Sparkles, MapPin, Tag, CheckCircle, AlertCircle, Edit } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EditProductModal from "@/components/products/EditProductModal";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [isFavourited, setIsFavourited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      const itemKey = user ? `fav_${user.id}_${product.id}` : `fav_${product.id}`;
      const saved = localStorage.getItem(itemKey);
      if (saved === "true") {
        setIsFavourited(true);
      } else {
        setIsFavourited(false);
      }
    }
  }, [product, user]);

  const toggleFavorite = () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    if (!product) return;
    const nextState = !isFavourited;
    setIsFavourited(nextState);

    const itemKey = `fav_${user.id}_${product.id}`;
    const accountKey = `kalasetu_favorites_${user.id || user.email}`;
    localStorage.setItem(itemKey, String(nextState));

    // Update account-specific kalasetu_favorites list
    const raw = localStorage.getItem(accountKey);
    let favList: Product[] = [];
    if (raw) {
      try {
        favList = JSON.parse(raw);
      } catch {}
    }

    if (nextState) {
      if (!favList.some((p) => p.id === product.id)) {
        favList.push(product);
      }
    } else {
      favList = favList.filter((p) => p.id !== product.id);
    }
    localStorage.setItem(accountKey, JSON.stringify(favList));

    const msg = nextState ? "❤️ Added to Favourites!" : "Removed from Favourites";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.title,
      text: product.short_description || product.title,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setToastMessage("✨ Shared craft link!");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("🔗 Link copied to clipboard!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage("🔗 Link: " + window.location.href);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSendEnquiry = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!enquiryMessage.trim() || !product) return;
    setSendingEnquiry(true);
    setEnquiryError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/products/${product.id}/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ message: enquiryMessage, type: "enquiry" }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to send enquiry");
      }
      setEnquirySent(true);
      setEnquiryMessage("");
      setTimeout(() => { setEnquirySent(false); setShowEnquiry(false); }, 3000);
    } catch (err: any) {
      setEnquiryError(err.message || "Failed to send enquiry. Please try again.");
    }
    setSendingEnquiry(false);
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setShowEnquiry(!showEnquiry);
  };

  useEffect(() => {
    if (slug) {
      api.getProductBySlug(slug)
        .then(setProduct)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const getImageUrl = (img: string | { url: string; thumbnail?: string }) => {
    if (typeof img === "string") return img;
    return img.url || "https://picsum.photos/seed/detail/800/800";
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square animate-shimmer rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 w-24 animate-shimmer rounded" />
              <div className="h-10 w-3/4 animate-shimmer rounded" />
              <div className="h-8 w-32 animate-shimmer rounded" />
              <div className="h-32 w-full animate-shimmer rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-5xl block mb-4">😔</span>
          <h1 className="text-2xl font-display font-bold mb-2">Product Not Found</h1>
          <p className="text-[var(--warm-gray)] mb-6">This product may have been removed or the URL is incorrect.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : ["https://picsum.photos/seed/detail/800/800"];
  const aiFields = product.ai_generated_fields || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--warm-gray)]">
            <Link href="/products" className="hover:text-[var(--terracotta)] flex items-center gap-1">
              <ArrowLeft size={14} /> Products
            </Link>
            <span>/</span>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
            <span className="text-[var(--charcoal)] truncate">{product.title}</span>
          </div>
        </div>

        {/* Product Detail */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--cream)] mb-4">
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                        i === selectedImage ? "border-[var(--terracotta)]" : "border-transparent"
                      }`}
                    >
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-craft capitalize">{product.category}</span>
                {product.subcategory && (
                  <span className="badge badge-craft capitalize">{product.subcategory}</span>
                )}
                {Object.values(aiFields).some(Boolean) && (
                  <span className="badge badge-ai flex items-center gap-1">
                    <Sparkles size={10} /> AI Catalogued
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)] mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-[var(--terracotta)]">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg mb-2">About this piece</h3>
                <p className="text-[var(--warm-gray)] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-2">
                    <Tag size={14} className="text-[var(--warm-gray)]" />
                    <span className="text-sm font-medium text-[var(--warm-gray)]">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/products?q=${tag}`}
                        className="px-2.5 py-1 bg-[var(--cream)] rounded-full text-xs text-[var(--warm-gray)] hover:text-[var(--terracotta)] hover:bg-[var(--clay-light)] transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Meet the Artisan Card */}
              {product.artisan_name && (
                <div className="card p-5 bg-gradient-to-r from-[var(--cream)] to-amber-50/40 border border-amber-200/50 mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--terracotta)] uppercase tracking-wider">Meet the Artisan</span>
                    <span className="badge badge-craft text-xs">Verified Artisan</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--terracotta)] to-[var(--clay)] flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                      {product.artisan_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-[var(--charcoal)]">{product.artisan_name}</h4>
                      {product.artisan_location && (
                        <p className="text-xs text-[var(--warm-gray)] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-[var(--terracotta)]" /> {product.artisan_location}
                        </p>
                      )}
                      <p className="text-xs text-[var(--charcoal)] mt-1 font-medium">
                        Specialty: <span className="capitalize">{product.category.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3">
                {user?.role === "artisan" ? (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    <Edit size={18} /> Edit Product & Catalogue
                  </button>
                ) : (
                  <button
                    onClick={handleContactClick}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> {isAuthenticated ? "Contact Artisan" : "Sign in to Contact"}
                  </button>
                )}
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isFavourited
                      ? "border-[var(--terracotta)] bg-[var(--terracotta)]/10 text-[var(--terracotta)] shadow-sm"
                      : "border-[var(--light-gray)] text-[var(--warm-gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                  }`}
                  title={isFavourited ? "Remove from favourites" : "Add to favourites"}
                >
                  <Heart size={20} className={isFavourited ? "fill-[var(--terracotta)]" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl border-2 border-[var(--light-gray)] text-[var(--warm-gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-all shadow-sm"
                  title="Share product link"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Action Toast Alert Notification */}
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 bg-[var(--cream)] border border-[var(--terracotta)]/30 text-[var(--terracotta)] font-bold text-xs rounded-xl text-center shadow-sm"
                >
                  {toastMessage}
                </motion.div>
              )}

              {/* Enquiry Form (Only shown for non-artisan buyers) */}
              {showEnquiry && user?.role !== "artisan" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white rounded-xl border border-[var(--light-gray)]"
                >
                  {enquirySent ? (
                    <div className="text-center py-4">
                      <CheckCircle size={32} className="mx-auto text-[var(--success)] mb-2" />
                      <p className="font-semibold text-[var(--success)]">Enquiry Sent!</p>
                      <p className="text-xs text-[var(--warm-gray)] mt-1">The artisan will respond soon.</p>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold mb-3">Send an Enquiry</h4>
                      {enquiryError && (
                        <div className="flex items-center gap-2 text-sm text-[var(--error)] bg-red-50 p-2 rounded-lg mb-3">
                          <AlertCircle size={14} /> {enquiryError}
                        </div>
                      )}
                      <textarea
                        className="input-field resize-none h-24 mb-3"
                        placeholder="Hi, I'm interested in this product..."
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                      />
                      <button
                        onClick={handleSendEnquiry}
                        disabled={sendingEnquiry || !enquiryMessage.trim()}
                        className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEnquiry ? "Sending..." : "Send Enquiry"}
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {/* Edit Product Modal */}
              {product && (
                <EditProductModal
                  product={product}
                  isOpen={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  onUpdated={(updatedProduct) => {
                    setProduct(updatedProduct);
                  }}
                />
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-6 border-t border-[var(--light-gray)]">
                <div className="text-center">
                  <p className="text-lg font-bold text-[var(--charcoal)]">{product.view_count}</p>
                  <p className="text-xs text-[var(--warm-gray)]">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[var(--charcoal)]">{product.enquiry_count}</p>
                  <p className="text-xs text-[var(--warm-gray)]">Enquiries</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
