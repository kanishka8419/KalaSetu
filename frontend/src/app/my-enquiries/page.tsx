"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Clock, ShoppingBag, CheckCircle2, ArrowRight, UserCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import type { Enquiry } from "@/types";

export default function MyEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSentEnquiries = () => {
    api.getMySentEnquiries()
      .then((data) => setEnquiries(data.enquiries))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSentEnquiries();
    const interval = setInterval(fetchSentEnquiries, 5000);
    return () => clearInterval(interval);
  }, []);

  const hasNewResponses = enquiries.some((e) => e.status === "responded" || e.status === "accepted");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-status-draft">Awaiting Reply</span>;
      case "responded":
        return <span className="badge badge-status-published bg-blue-100 text-blue-800">Responded</span>;
      case "accepted":
        return <span className="badge badge-status-published bg-emerald-100 text-emerald-800">Accepted</span>;
      case "rejected":
        return <span className="badge badge-status-draft bg-red-100 text-red-800">Declined</span>;
      default:
        return <span className="badge badge-status-draft">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {hasNewResponses && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300 rounded-2xl p-4 mb-6 flex items-center gap-3 text-emerald-900 shadow-sm">
            <span className="text-xl">🔔</span>
            <div>
              <p className="text-sm font-bold">Artisan Response Received!</p>
              <p className="text-xs text-emerald-800">An artisan has replied to your enquiry below.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--charcoal)]">
              My Enquiries & Orders
            </h1>
            <p className="text-sm text-[var(--warm-gray)] mt-1">
              Track messages sent to artisans and read their responses.
            </p>
          </div>
          <Link href="/products" className="btn-secondary text-sm flex items-center gap-1.5 hidden sm:flex">
            <ShoppingBag size={15} /> Browse Crafts
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="card p-6 h-36 animate-shimmer" />
            ))}
          </div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-6">
            {enquiries.map((enquiry, i) => (
              <motion.div
                key={enquiry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 border-l-4 border-l-[var(--terracotta)]"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4 pb-3 border-b border-[var(--light-gray)]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-lg text-[var(--charcoal)]">
                        {enquiry.product_title || "Handcrafted Item"}
                      </h3>
                      <span className="badge badge-craft text-xs uppercase">{enquiry.type || "enquiry"}</span>
                    </div>
                    {enquiry.buyer_name && (
                      <p className="text-xs text-[var(--warm-gray)] flex items-center gap-1 mt-1">
                        <UserCheck size={12} className="text-[var(--terracotta)]" /> Artisan: <strong className="text-[var(--charcoal)]">{enquiry.buyer_name}</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(enquiry.status)}
                    <span className="text-xs text-[var(--warm-gray)] flex items-center gap-1">
                      <Clock size={12} /> {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Buyer's Sent Message */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[var(--warm-gray)] uppercase tracking-wider mb-1">Your Message</p>
                  <div className="bg-[var(--cream)] rounded-xl p-3.5 text-sm text-[var(--charcoal)] leading-relaxed">
                    {enquiry.message}
                  </div>
                </div>

                {/* Artisan's Response Box */}
                {enquiry.response_message ? (
                  <div className="bg-gradient-to-r from-[var(--terracotta)]/10 via-[var(--brass)]/5 to-white rounded-xl p-4 border border-[var(--terracotta)]/20 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-[var(--terracotta)] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={15} /> Artisan Response
                      </p>
                      <span className="text-xs text-[var(--warm-gray)] font-medium">Responded</span>
                    </div>
                    <p className="text-sm text-[var(--charcoal)] font-medium leading-relaxed">
                      {enquiry.response_message}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                    <Clock size={14} className="text-amber-600 shrink-0" />
                    <span>The artisan has received your enquiry and will reply shortly.</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16 px-4">
            <MessageCircle size={48} className="mx-auto text-[var(--clay)] mb-4" />
            <h3 className="font-display text-xl font-semibold text-[var(--charcoal)] mb-2">No enquiries sent yet</h3>
            <p className="text-[var(--warm-gray)] text-sm max-w-md mx-auto mb-6">
              When you contact artisans about custom craft orders or product questions, their responses will appear here.
            </p>
            <Link href="/products" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
              Explore Products <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
