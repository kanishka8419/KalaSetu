"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, Shield, MapPin, ArrowRight, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/types";

const CATEGORIES = [
  { name: "Pottery", icon: "🏺", color: "#C75B39" },
  { name: "Textiles", icon: "🧵", color: "#2E4057" },
  { name: "Jewelry", icon: "💍", color: "#B8860B" },
  { name: "Woodwork", icon: "🪵", color: "#8B4513" },
  { name: "Metalwork", icon: "⚒️", color: "#6B6B7B" },
  { name: "Painting", icon: "🎨", color: "#E07B5A" },
  { name: "Leather", icon: "👜", color: "#A0522D" },
  { name: "Glass", icon: "🫧", color: "#3D5A80" },
];

const FEATURES = [
  {
    icon: <Sparkles size={28} />,
    title: "AI-Powered Cataloguing",
    desc: "Upload a photo — our AI generates title, description, tags, and a fair price suggestion instantly.",
  },
  {
    icon: <Search size={28} />,
    title: "Smart Discovery",
    desc: "Semantic search understands what you mean, not just what you type. Find the perfect craft piece effortlessly.",
  },
  {
    icon: <Shield size={28} />,
    title: "Artisan Verified",
    desc: "Every artisan is verified. Every product is authentic. Every purchase supports a real craftsperson.",
  },
  {
    icon: <MapPin size={28} />,
    title: "Discover Nearby",
    desc: "Find artisans near you. Support local craftsmanship and see the hands behind the art.",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
} as const;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts({ per_page: 8 }).then((data) => setProducts(data.products)).catch(() => {});
  }, []);

  const getImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0) return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
    const img = product.images[0];
    if (typeof img === "string") return img;
    return img.url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--cream)] via-[var(--off-white)] to-[var(--clay-light)]">
        <div className="craft-pattern absolute inset-0 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--terracotta)]/10 text-[var(--terracotta)] text-sm font-medium mb-6">
                <Sparkles size={14} /> AI-Powered Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[var(--charcoal)] leading-tight mb-6">
                Where <span className="gradient-text">Craft</span> Meets{" "}
                <span className="gradient-text">Intelligence</span>
              </h1>
              <p className="text-lg text-[var(--warm-gray)] mb-8 max-w-lg leading-relaxed">
                Upload your craft. Let AI catalogue it. Reach buyers worldwide.
                KalaSetu bridges India&apos;s artisan heritage with modern technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary text-center py-3 px-8 text-base rounded-lg inline-flex items-center justify-center gap-2">
                  Start Selling <ArrowRight size={18} />
                </Link>
                <Link href="/products" className="btn-secondary text-center py-3 px-8 text-base rounded-lg">
                  Explore Crafts
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { title: "Terracotta & Blue Pottery", url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80" },
                { title: "Handwoven Textiles", url: "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=600&q=80" },
                { title: "Woodwork & Carvings", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80" },
                { title: "Brass Metalcraft", url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className={`rounded-2xl overflow-hidden shadow-lg border border-[var(--light-gray)] ${i === 1 || i === 3 ? "mt-6" : ""}`}
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-bold text-[var(--charcoal)] mb-4">
              Explore Craft Categories
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--warm-gray)] max-w-2xl mx-auto">
              From ancient pottery traditions to intricate metalwork — discover the diversity of Indian artisanship.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Link
                  href={`/products?category=${cat.name.toLowerCase()}`}
                  className="card p-6 text-center group cursor-pointer block"
                >
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <h3 className="font-display font-semibold text-[var(--charcoal)]">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-bold text-[var(--charcoal)] mb-2">
                Featured Crafts
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[var(--warm-gray)]">
                Handpicked artisan creations, freshly catalogued by AI
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/products" className="text-[var(--terracotta)] font-medium text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {(products.length > 0 ? products.slice(0, 8) : Array(8).fill(null)).map((product, i) => (
              <motion.div key={product?.id || i} variants={fadeUp}>
                {product ? (
                  <Link href={`/products/${product.slug}`} className="card group block">
                    <div className="card-image-wrapper aspect-square">
                      <img
                        src={getImageUrl(product)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <span className="badge badge-craft text-xs mb-2">{product.category}</span>
                      <h3 className="font-display font-semibold text-[var(--charcoal)] text-sm line-clamp-2 mb-1 group-hover:text-[var(--terracotta)] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[var(--terracotta)] font-bold">₹{product.price.toLocaleString("en-IN")}</p>
                      {product.artisan_name && (
                        <p className="text-xs text-[var(--warm-gray)] mt-1">by {product.artisan_name}</p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="card">
                    <div className="aspect-square animate-shimmer" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-16 animate-shimmer rounded" />
                      <div className="h-4 w-full animate-shimmer rounded" />
                      <div className="h-5 w-20 animate-shimmer rounded" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS / STORYTELLING ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-[var(--terracotta)] font-medium text-sm mb-2 tracking-wider uppercase">
              From Hands to Home
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-bold text-[var(--charcoal)] mb-4">
              The KalaSetu Journey
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { step: "01", title: "Artisan Uploads", desc: "A craftsperson photographs their creation and uploads it to KalaSetu. That's all they need to do.", icon: "📸" },
              { step: "02", title: "AI Catalogues", desc: "Our AI analyzes the image — detecting materials, style, category — and generates a complete product listing with fair pricing.", icon: "🤖" },
              { step: "03", title: "Buyer Discovers", desc: "Buyers find the perfect craft through semantic search, browse curated categories, and connect directly with artisans.", icon: "🛍️" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="text-center">
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <span className="text-[var(--terracotta)] font-display font-bold text-lg">Step {item.step}</span>
                <h3 className="text-xl font-display font-bold text-[var(--charcoal)] mt-1 mb-3">{item.title}</h3>
                <p className="text-[var(--warm-gray)] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-[var(--charcoal)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-6 rounded-xl border border-gray-700 hover:border-[var(--terracotta)] transition-colors"
              >
                <div className="text-[var(--clay)] mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-gradient-to-r from-[var(--terracotta)] to-[var(--brass)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Share Your Craft with the World?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of artisans using AI to reach new customers. It&apos;s free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-white text-[var(--terracotta)] font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 justify-center">
                Join as Artisan <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="border-2 border-white/50 text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
