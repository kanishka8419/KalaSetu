"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import type { Enquiry } from "@/types";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchEnquiries = () => {
    api.getMyEnquiries()
      .then((data) => setEnquiries(data.enquiries))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
    const interval = setInterval(fetchEnquiries, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await api.replyToEnquiry(id, replyText, "responded");
      setEnquiries(enquiries.map((e) =>
        e.id === id ? { ...e, response_message: replyText, status: "responded" } : e
      ));
      setReplyId(null);
      setReplyText("");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display font-bold text-[var(--charcoal)] mb-2">Enquiries</h1>
        <p className="text-[var(--warm-gray)] mb-8">Messages from interested buyers</p>

        {loading ? (
          <div className="space-y-4">{Array(3).fill(null).map((_, i) => <div key={i} className="card p-6 h-32 animate-shimmer" />)}</div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-4">
            {enquiries.map((enquiry, i) => (
              <motion.div
                key={enquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--charcoal)]">{enquiry.product_title || "Product"}</p>
                      <span className="badge badge-craft text-xs uppercase">{enquiry.type || "enquiry"}</span>
                    </div>
                    {enquiry.buyer_name && (
                      <p className="text-xs font-medium text-[var(--terracotta)] mt-0.5">From: {enquiry.buyer_name}</p>
                    )}
                    <p className="text-xs text-[var(--warm-gray)] flex items-center gap-1 mt-1">
                      <Clock size={10} /> {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`badge text-xs ${
                    enquiry.status === "pending" ? "badge-status-draft" : "badge-status-published"
                  }`}>{enquiry.status}</span>
                </div>

                <div className="bg-[var(--cream)] rounded-lg p-3 mb-3">
                  <p className="text-sm text-[var(--charcoal)]">{enquiry.message}</p>
                </div>

                {enquiry.response_message && (
                  <div className="bg-[var(--terracotta)]/5 rounded-lg p-3 mb-3 ml-8 border-l-2 border-[var(--terracotta)]">
                    <p className="text-xs text-[var(--warm-gray)] mb-1">Your reply:</p>
                    <p className="text-sm">{enquiry.response_message}</p>
                  </div>
                )}

                {!enquiry.response_message && (
                  <>
                    {replyId === enquiry.id ? (
                      <div className="flex gap-2 mt-3">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="input-field flex-1 text-sm"
                          placeholder="Type your reply..."
                          autoFocus
                        />
                        <button onClick={() => handleReply(enquiry.id)} className="btn-primary text-sm px-4 flex items-center gap-1">
                          <Send size={14} /> Send
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyId(enquiry.id)}
                        className="text-sm text-[var(--terracotta)] font-medium hover:underline flex items-center gap-1"
                      >
                        <MessageCircle size={14} /> Reply
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <MessageCircle size={48} className="mx-auto text-[var(--clay)] mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No enquiries yet</h3>
            <p className="text-[var(--warm-gray)] text-sm">When buyers reach out, their messages will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
