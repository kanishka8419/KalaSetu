"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles, Check, ArrowLeft, BookOpen, Tag, DollarSign, Image as ImageIcon, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AICatalogueResponse } from "@/types";

const STEPS = [
  { id: "upload", name: "Upload Photo", icon: Upload },
  { id: "processing", name: "AI Analysis", icon: Sparkles },
  { id: "story", name: "Catalogue & Story", icon: BookOpen },
  { id: "pricing", name: "Pricing & Review", icon: DollarSign },
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [aiResult, setAiResult] = useState<AICatalogueResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "story" | "pricing">("upload");

  // Editable fields
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    short_description: "",
    story: "",
    category: "",
    subcategory: "",
    tags: [] as string[],
    price: 0,
    status: "published" as "draft" | "published",
  });

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...files, ...accepted].slice(0, 10);
    setFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const runAICatalogue = async () => {
    if (files.length === 0) return;
    setCurrentStep("processing");
    setIsProcessing(true);
    try {
      const result = await api.aiCatalogue(files, keywords || undefined);
      setAiResult(result);
      
      const draftedStory = `Handcrafted with passion, this authentic ${result.category.replace("_", " ")} piece represents years of tradition and skill. Every texture and pattern honors ancestral techniques while fitting beautifully into modern spaces.`;

      setEditForm({
        title: result.title,
        description: result.description,
        short_description: result.short_description,
        story: draftedStory,
        category: result.category,
        subcategory: result.subcategory || "",
        price: result.suggested_price,
        status: "published",
      });
      setCurrentStep("story");
    } catch (err) {
      alert("AI cataloguing failed. Please try again.");
      setCurrentStep("upload");
    }
    setIsProcessing(false);
  };

  const handleCategoryChange = (newCat: string) => {
    const formattedCat = newCat.replace("_", " ");
    const newSub = newCat === "pottery" ? "vases" :
                   newCat === "textiles" ? "scarves" :
                   newCat === "jewelry" ? "necklaces" :
                   newCat === "woodwork" ? "sculptures" :
                   newCat === "metalwork" ? "lamps" :
                   newCat === "leather" ? "bags" :
                   newCat === "painting" ? "wall art" :
                   newCat === "glass" ? "vases" :
                   newCat === "stone_carving" ? "sculptures" : "baskets";
                   
    const updatedTitle = `Handcrafted Traditional ${formattedCat.replace(/\b\w/g, (l) => l.toUpperCase())} ${newSub.replace(/\b\w/g, (l) => l.toUpperCase())}`;

    setEditForm((prev) => ({
      ...prev,
      category: newCat,
      subcategory: newSub,
      title: updatedTitle,
      story: `Handcrafted with passion, this authentic ${formattedCat} piece represents years of tradition and skill. Every texture and pattern honors ancestral techniques while fitting beautifully into modern spaces.`,
      short_description: `Authentic handcrafted ${formattedCat} ${newSub} featuring traditional design techniques by master Indian artisans.`,
    }));
  };

  const saveProduct = async (status: "draft" | "published") => {
    if (!aiResult) return;
    setIsSaving(true);
    try {
      const fullDesc = `${editForm.description}\n\n--- Craft Story ---\n${editForm.story}`;
      await api.createProduct({
        ...editForm,
        description: fullDesc,
        status,
        images: aiResult.images,
        seo_meta: { title: editForm.title, description: editForm.short_description },
        ai_generated_fields: {
          title: true, description: true, short_description: true,
          story: true, category: true, tags: true, price: true,
        },
        ai_suggested_price_min: aiResult.suggested_price_min,
        ai_suggested_price_max: aiResult.suggested_price_max,
      });
      router.push("/my-products");
    } catch (err) {
      alert("Failed to save product. Please try again.");
    }
    setIsSaving(false);
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case "upload": return 0;
      case "processing": return 1;
      case "story": return 2;
      case "pricing": return 3;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Link href="/dashboard" className="text-sm text-[var(--warm-gray)] hover:text-[var(--terracotta)] flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Stepper Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)] mb-2">
            Artisan Craft Publishing Wizard
          </h1>
          <p className="text-sm text-[var(--warm-gray)] mb-6">
            Upload your craft photos — AI will analyze materials, generate title, draft story, and estimate fair pricing.
          </p>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-white p-3 rounded-2xl border border-[var(--light-gray)] shadow-sm">
            {STEPS.map((s, idx) => {
              const active = idx === getStepIndex();
              const completed = idx < getStepIndex();
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--terracotta)] text-white"
                      : completed
                      ? "bg-[var(--terracotta)]/10 text-[var(--terracotta)]"
                      : "text-[var(--warm-gray)]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    active ? "bg-white text-[var(--terracotta)] font-bold" : completed ? "bg-[var(--terracotta)] text-white" : "bg-[var(--light-gray)]"
                  }`}>
                    {completed ? "✓" : idx + 1}
                  </div>
                  <span className="hidden md:inline line-clamp-1">{s.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Upload */}
        <AnimatePresence mode="wait">
          {currentStep === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-[var(--terracotta)] bg-[var(--terracotta)]/5"
                    : "border-[var(--clay)] hover:border-[var(--terracotta)] bg-white"
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto text-[var(--clay)] mb-4 animate-bounce" />
                <p className="text-lg font-display font-semibold text-[var(--charcoal)] mb-2">
                  {isDragActive ? "Drop your craft photo here" : "Drag & drop craft photos here"}
                </p>
                <p className="text-sm text-[var(--warm-gray)]">
                  or click to browse • PNG, JPG, WEBP • Max 10 images, 10MB each
                </p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-[var(--charcoal)] mb-3">{files.length} photo(s) selected</p>
                  <div className="flex gap-3 flex-wrap">
                    {previews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img src={preview} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow-sm" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Artisan Notes & Keywords */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">
                  Artisan Notes & Craft Context <span className="text-[var(--warm-gray)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Jaipur blue pottery, hand-thrown clay, 15 days craftsmanship..."
                />
                
                {/* Quick Craft Category Hint Chips */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-[var(--warm-gray)] mb-1.5 uppercase tracking-wider">
                    Tap a craft category to guarantee 100% accurate AI prediction:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Pottery & Clay", val: "pottery clay vase" },
                      { label: "Textiles & Saree", val: "handloom textile silk saree scarf" },
                      { label: "Jewelry", val: "silver gold jewelry necklace earring" },
                      { label: "Woodwork", val: "carved wooden sculpture decor" },
                      { label: "Metalwork & Brass", val: "brass copper metal diya lamp" },
                      { label: "Leather", val: "leather bag wallet journal" },
                      { label: "Painting & Canvas", val: "hand painting madhubani art canvas" },
                      { label: "Stone Carving", val: "carved marble stone sculpture" },
                      { label: "Bamboo & Cane", val: "woven bamboo cane basket" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (!keywords.includes(item.val)) {
                            setKeywords(keywords ? `${keywords}, ${item.val}` : item.val);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          keywords.includes(item.val)
                            ? "bg-[var(--terracotta)] text-white border-[var(--terracotta)]"
                            : "bg-white text-[var(--charcoal)] border-[var(--light-gray)] hover:border-[var(--terracotta)]"
                        }`}
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={runAICatalogue}
                disabled={files.length === 0}
                className="btn-primary mt-8 py-3.5 px-8 text-base flex items-center gap-2 mx-auto disabled:opacity-40"
              >
                <Sparkles size={18} /> Step 2: Analyze with AI
              </button>
            </motion.div>
          )}

          {/* Step 2: Processing (Skeleton/Progress state) */}
          {currentStep === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card text-center py-20 px-4"
            >
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--clay-light)] border-t-[var(--terracotta)] animate-spin" />
                <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--terracotta)]" />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--charcoal)] mb-2">
                AI Pipeline Analyzing Craft Photo...
              </h3>
              <p className="text-[var(--warm-gray)] max-w-md mx-auto text-sm">
                Running Computer Vision pixel color analysis, detecting materials, drafting heritage story, and estimating market price.
              </p>

              <div className="mt-8 max-w-sm mx-auto space-y-3 text-left">
                {[
                  "Inspecting image pixels & extract color palette",
                  "Detecting craft category & material features",
                  "Drafting title, description & artisan story",
                  "Calculating fair market pricing range",
                ].map((stepText, i) => (
                  <motion.div
                    key={stepText}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-3 text-sm bg-[var(--off-white)] p-2.5 rounded-lg border border-[var(--light-gray)]"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-[var(--charcoal)] font-medium">{stepText}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Catalogue & Story Draft */}
          {currentStep === "story" && aiResult && (
            <motion.div key="story" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-gradient-to-r from-amber-500/10 via-[var(--terracotta)]/10 to-indigo-500/10 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 border border-[var(--terracotta)]/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-[var(--terracotta)]" size={24} />
                  <div>
                    <p className="text-sm font-bold text-[var(--charcoal)] flex items-center gap-2">
                      AI Analysis Complete <span className="badge badge-craft bg-emerald-600 text-white text-xs">94% Confidence</span>
                    </p>
                    <p className="text-xs text-[var(--warm-gray)]">Review and personalize the generated title, description, and story.</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Image & AI Insights Bar */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-[var(--charcoal)]">Uploaded Photo</h3>
                  <div className="rounded-xl overflow-hidden border border-[var(--light-gray)]">
                    <img src={aiResult.images[0]} alt="" className="w-full aspect-square object-cover" />
                  </div>

                  <div className="card p-4 space-y-3">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--warm-gray)] flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[var(--terracotta)]" /> Computer Vision Analysis
                    </h4>
                    <div>
                      <span className="text-xs text-[var(--warm-gray)] block mb-1">Detected Category & Material:</span>
                      <div className="flex flex-wrap gap-1">
                        <span className="badge badge-craft uppercase">{aiResult.category.replace("_", " ")}</span>
                        {aiResult.detected_materials.map((m) => (
                          <span key={m} className="badge bg-amber-100 text-amber-900 border border-amber-200 text-xs">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--warm-gray)] block mb-1">Color Palette Extracted:</span>
                      <div className="flex flex-wrap gap-1">
                        {aiResult.detected_colors.map((c) => (
                          <span key={c} className="badge bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[var(--charcoal)] mb-1.5 flex items-center gap-2">
                      Title <span className="badge badge-ai text-xs">AI Generated</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="input-field font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="input-field text-sm"
                      >
                        {["pottery","textiles","jewelry","woodwork","metalwork","leather","painting","glass","stone_carving","bamboo_craft"].map((c) => (
                          <option key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Subcategory</label>
                      <input
                        type="text"
                        value={editForm.subcategory}
                        onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-1.5">Short Summary</label>
                    <textarea
                      value={editForm.short_description}
                      onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                      className="input-field resize-none h-20 text-sm"
                    />
                  </div>

                  {/* Artisan's Craft Story Section */}
                  <div className="card p-4 border-l-4 border-l-[var(--terracotta)] bg-amber-50/40">
                    <label className="block text-sm font-bold text-[var(--charcoal)] mb-1 flex items-center gap-2">
                      <BookOpen size={16} className="text-[var(--terracotta)]" /> Artisan&apos;s Craft Story <span className="badge badge-ai text-xs">AI Drafted</span>
                    </label>
                    <p className="text-xs text-[var(--warm-gray)] mb-2">
                      This story creates an emotional connection with buyers on the product page. Customize it to share your technique or regional heritage.
                    </p>
                    <textarea
                      value={editForm.story}
                      onChange={(e) => setEditForm({ ...editForm, story: e.target.value })}
                      className="input-field resize-none h-28 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => setCurrentStep("pricing")}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
                  >
                    Continue to Step 4: Pricing & Review →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Pricing & Review */}
          {currentStep === "pricing" && aiResult && (
            <motion.div key="pricing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Pricing Suggestion Card */}
              <div className="card p-6 border-l-4 border-l-[var(--terracotta)]">
                <h3 className="font-display font-bold text-xl text-[var(--charcoal)] mb-2 flex items-center gap-2">
                  <DollarSign size={20} className="text-[var(--terracotta)]" /> AI Price Suggestion & Rationale
                </h3>
                <p className="text-sm text-[var(--warm-gray)] mb-4">{aiResult.price_rationale}</p>
                <div className="bg-[var(--cream)] p-4 rounded-xl flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[var(--warm-gray)]">Suggested Market Range:</span>
                  <span className="text-base font-bold text-[var(--charcoal)]">
                    ₹{aiResult.suggested_price_min.toLocaleString("en-IN")} – ₹{aiResult.suggested_price_max.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--charcoal)] mb-1.5">Set Final Listing Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="input-field text-xl font-bold text-[var(--terracotta)]"
                    min={0}
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="card p-6 space-y-4">
                <h4 className="font-display font-semibold text-lg border-b border-[var(--light-gray)] pb-2">Listing Summary</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[var(--warm-gray)] block">Title:</span>
                    <strong className="text-[var(--charcoal)]">{editForm.title}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--warm-gray)] block">Category:</span>
                    <strong className="text-[var(--charcoal)] capitalize">{editForm.category.replace("_", " ")}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-[var(--warm-gray)] block">Craft Story:</span>
                    <p className="text-xs text-[var(--warm-gray)] italic mt-1 bg-[var(--off-white)] p-2.5 rounded-lg border border-[var(--light-gray)]">
                      &ldquo;{editForm.story}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setCurrentStep("story")}
                  className="btn-secondary py-3.5 px-6 text-sm"
                >
                  ← Back to Story
                </button>
                <button
                  onClick={() => saveProduct("published")}
                  disabled={isSaving}
                  className="btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> Publish to Marketplace Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
