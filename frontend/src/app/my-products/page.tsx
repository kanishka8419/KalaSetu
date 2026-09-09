"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import Header from "@/components/layout/Header";
import EditProductModal from "@/components/products/EditProductModal";
import { api } from "@/lib/api";
import type { Product } from "@/types";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "draft" | "published" | "sold">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    api.getMyProducts({ page: 1 })
      .then((data) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? products : products.filter((p) => p.status === tab);

  const getImageUrl = (product: Product) => {
    if (!product.images?.length) return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
    const img = product.images[0];
    return typeof img === "string" ? img : (img as any).url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this product?")) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch {}
  };

  const handleProductUpdated = (updated: Product) => {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold text-[var(--charcoal)]">My Products</h1>
          <Link href="/upload" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Product
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 mb-8 w-fit border border-[var(--light-gray)]">
          {(["all", "draft", "published", "sold"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-[var(--terracotta)] text-white" : "text-[var(--warm-gray)] hover:text-[var(--charcoal)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="card p-4"><div className="h-48 animate-shimmer rounded-lg mb-3" /><div className="h-4 animate-shimmer rounded w-3/4" /></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={getImageUrl(product)} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge text-xs ${
                      product.status === "published" ? "badge-status-published" :
                      product.status === "sold" ? "badge-status-sold" : "badge-status-draft"
                    }`}>{product.status}</span>
                    <span className="badge badge-craft text-xs">{product.category}</span>
                  </div>
                  <h3 className="font-display font-semibold text-sm line-clamp-2 mb-1">{product.title}</h3>
                  <p className="text-[var(--terracotta)] font-bold mb-3">₹{product.price.toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--warm-gray)] mb-3">
                    <span className="flex items-center gap-1"><Eye size={12} /> {product.view_count}</span>
                    <span>•</span>
                    <span>{product.enquiry_count} enquiries</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/products/${product.slug}`} className="flex-1 btn-secondary text-xs py-1.5 text-center">View</Link>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="px-3 py-1.5 bg-[var(--cream)] text-[var(--terracotta)] hover:bg-[var(--clay-light)] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-[var(--warm-gray)] hover:text-[var(--error)] rounded transition-colors" title="Delete product">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <Package size={48} className="mx-auto text-[var(--clay)] mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No {tab !== "all" ? tab : ""} products</h3>
            <p className="text-[var(--warm-gray)] text-sm mb-4">Upload your craft and let AI create a stunning listing.</p>
            <Link href="/upload" className="btn-primary inline-flex items-center gap-2 text-sm"><Plus size={16} /> Upload Craft</Link>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}
