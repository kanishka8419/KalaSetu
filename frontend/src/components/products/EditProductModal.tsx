"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Save, Sparkles, Image as ImageIcon, Trash2, Check } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedProduct: Product) => void;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onUpdated,
}: EditProductModalProps) {
  const [title, setTitle] = useState(product.title);
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState(product.subcategory || "");
  const [price, setPrice] = useState(product.price);
  const [shortDescription, setShortDescription] = useState(product.short_description || "");
  const [description, setDescription] = useState(product.description);
  const [tagsInput, setTagsInput] = useState((product.tags || []).join(", "));
  const [images, setImages] = useState<(string | { url: string; thumbnail?: string })[]>(product.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const getImageUrl = (img: string | { url: string; thumbnail?: string }) => {
    if (typeof img === "string") return img;
    return img.url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddNewFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    setUploading(true);
    setError("");
    try {
      // Use aiCatalogue endpoint to upload & store new images
      const res = await api.aiCatalogue(selectedFiles);
      const uploadedUrls = res.images || [];
      setImages([...images, ...uploadedUrls]);
    } catch {
      setError("Failed to upload new images. Please try again.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !category) {
      setError("Title and Category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await api.updateProduct(product.id, {
        title,
        category,
        subcategory,
        price,
        short_description: shortDescription,
        description,
        tags,
        images,
      });

      setSuccess(true);
      onUpdated(updated);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[var(--light-gray)] my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--light-gray)] pb-4 mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-[var(--charcoal)] flex items-center gap-2">
                <ImageIcon size={22} className="text-[var(--terracotta)]" /> Edit Catalogue & Images
              </h2>
              <p className="text-xs text-[var(--warm-gray)]">Update your product details, craft story, and image gallery</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--warm-gray)] hover:text-[var(--charcoal)] rounded-lg hover:bg-[var(--cream)]"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[var(--error)] text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 flex items-center gap-2">
              <Check size={18} /> Product and catalog updated successfully!
            </div>
          )}

          <div className="space-y-6">
            {/* Image Management Section */}
            <div>
              <label className="block text-sm font-bold text-[var(--charcoal)] mb-2 flex items-center justify-between">
                <span>Product Images Catalog</span>
                <span className="text-xs font-normal text-[var(--warm-gray)]">({images.length} images)</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--light-gray)] group">
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload New Image Button */}
                <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--clay)] hover:border-[var(--terracotta)] bg-[var(--cream)]/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                  <Upload size={20} className="text-[var(--terracotta)] mb-1" />
                  <span className="text-[10px] font-semibold text-[var(--charcoal)]">
                    {uploading ? "Uploading..." : "+ Add Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddNewFiles}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field text-sm capitalize"
                >
                  {["pottery", "textiles", "jewelry", "woodwork", "metalwork", "leather", "painting", "glass", "stone_carving", "bamboo_craft"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Subcategory</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g. bowls, scarves..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="input-field text-sm font-bold text-[var(--terracotta)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1">Full Description & Craft Story</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field text-sm resize-none h-32"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[var(--light-gray)]">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2.5 px-5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} /> {saving ? "Saving Changes..." : "Save Product & Catalog Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
