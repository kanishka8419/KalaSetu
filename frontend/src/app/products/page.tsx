"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import type { SearchResult, Product } from "@/types";

const CATEGORIES = [
  "All", "Pottery", "Textiles", "Jewelry", "Woodwork",
  "Metalwork", "Leather", "Painting", "Glass", "Stone Carving", "Bamboo Craft",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<(SearchResult | Product)[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.search({
        q: query || undefined,
        category: category && category !== "All" ? category.toLowerCase().replace(" ", "_") : undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        page,
        per_page: 20,
        sort_by: sortBy,
      });
      setResults(data.results || []);
      setTotal(data.total || 0);
      setSuggestions(data.suggestions || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [query, category, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getImageUrl = (item: SearchResult | Product) => {
    if (!item.images || item.images.length === 0) return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
    const img = item.images[0];
    if (typeof img === "string") return img;
    return (img as any).url || (img as any).thumbnail || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <Header />

      {/* Search Bar */}
      <div className="bg-white border-b border-[var(--light-gray)] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--warm-gray)] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchResults()}
                className="input-field"
                style={{ paddingLeft: "2.75rem" }}
                placeholder="Search handmade crafts, artisans, materials..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                showFilters ? "border-[var(--terracotta)] text-[var(--terracotta)]" : "border-[var(--light-gray)] text-[var(--warm-gray)]"
              }`}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button onClick={fetchResults} className="btn-primary px-6">
              Search
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[var(--light-gray)] grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-xs font-medium text-[var(--warm-gray)] mb-1 block">Min Price (₹)</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--warm-gray)] mb-1 block">Max Price (₹)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field text-sm" placeholder="50000" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--warm-gray)] mb-1 block">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); setSortBy("relevance"); setCategory(""); setQuery(""); }} className="text-sm text-[var(--terracotta)] font-medium hover:underline">
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => {
            const isActive =
              (cat === "All" && (!category || category === "")) ||
              (category &&
                category.toLowerCase().replace(/[\s_]+/g, "") ===
                  cat.toLowerCase().replace(/[\s_]+/g, ""));
            return (
              <button
                key={cat}
                onClick={() => {
                  setPage(1);
                  setCategory(cat === "All" ? "" : cat.toLowerCase().replace(/\s+/g, "_"));
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--terracotta)] text-white shadow-sm"
                    : "bg-white border border-[var(--light-gray)] text-[var(--warm-gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips */}
        {(category || minPrice || maxPrice || sortBy !== "relevance" || query) && (
          <div className="flex items-center gap-2 flex-wrap mb-6 bg-white p-3 rounded-xl border border-[var(--light-gray)] text-xs">
            <span className="font-semibold text-[var(--charcoal)]">Active Filters:</span>
            {query && (
              <span className="inline-flex items-center gap-1 bg-[var(--cream)] text-[var(--terracotta)] px-2.5 py-1 rounded-full border border-[var(--clay-light)]">
                Query: &ldquo;{query}&rdquo;
                <X size={12} className="cursor-pointer hover:opacity-80" onClick={() => setQuery("")} />
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 bg-[var(--cream)] text-[var(--terracotta)] px-2.5 py-1 rounded-full border border-[var(--clay-light)] capitalize">
                Category: {category.replace("_", " ")}
                <X size={12} className="cursor-pointer hover:opacity-80" onClick={() => setCategory("")} />
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1 bg-[var(--cream)] text-[var(--terracotta)] px-2.5 py-1 rounded-full border border-[var(--clay-light)]">
                Min: ₹{minPrice}
                <X size={12} className="cursor-pointer hover:opacity-80" onClick={() => setMinPrice("")} />
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 bg-[var(--cream)] text-[var(--terracotta)] px-2.5 py-1 rounded-full border border-[var(--clay-light)]">
                Max: ₹{maxPrice}
                <X size={12} className="cursor-pointer hover:opacity-80" onClick={() => setMaxPrice("")} />
              </span>
            )}
            {sortBy !== "relevance" && (
              <span className="inline-flex items-center gap-1 bg-[var(--cream)] text-[var(--terracotta)] px-2.5 py-1 rounded-full border border-[var(--clay-light)] capitalize">
                Sort: {sortBy.replace("_", " ")}
                <X size={12} className="cursor-pointer hover:opacity-80" onClick={() => setSortBy("relevance")} />
              </span>
            )}
            <button
              onClick={() => {
                setQuery("");
                setCategory("");
                setMinPrice("");
                setMaxPrice("");
                setSortBy("relevance");
                setPage(1);
              }}
              className="text-[var(--terracotta)] underline ml-auto font-medium hover:text-[var(--terracotta-dark)]"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--warm-gray)]">
            {loading ? "Searching..." : `${total} product${total !== 1 ? "s" : ""} found`}
            {query && <span className="text-[var(--charcoal)] font-medium"> for &ldquo;{query}&rdquo;</span>}
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(null).map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square animate-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-16 animate-shimmer rounded" />
                  <div className="h-4 w-full animate-shimmer rounded" />
                  <div className="h-5 w-20 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((item, i) => (
              <motion.div
                key={item.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/products/${item.slug}`} className="card group block">
                  <div className="card-image-wrapper aspect-square">
                    <img src={getImageUrl(item)} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="badge badge-craft text-xs">{item.category}</span>
                      {(item as any).match_reason && (
                        <span className="badge badge-ai text-[10px] truncate max-w-[140px]" title={(item as any).match_reason}>
                          ✨ {(item as any).match_reason}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-sm text-[var(--charcoal)] line-clamp-2 mb-1 group-hover:text-[var(--terracotta)] transition-colors">
                      {item.title}
                    </h3>
                    {item.short_description && (
                      <p className="text-xs text-[var(--warm-gray)] line-clamp-2 mb-2">{item.short_description}</p>
                    )}
                    <p className="text-[var(--terracotta)] font-bold">₹{item.price.toLocaleString("en-IN")}</p>
                    {item.artisan_name && (
                      <p className="text-xs text-[var(--warm-gray)] mt-1">by {item.artisan_name}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="font-display text-xl font-semibold text-[var(--charcoal)] mb-2">No products found</h3>
            <p className="text-[var(--warm-gray)]">Try adjusting your search or filters</p>
            {suggestions.length > 0 && (
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <span className="text-sm text-[var(--warm-gray)]">Try:</span>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="text-sm text-[var(--terracotta)] hover:underline">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn-secondary text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-[var(--warm-gray)]">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage(page + 1)}
              className="btn-secondary text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
