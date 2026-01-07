"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, ExternalLink } from "lucide-react";
import type { Seller, Table } from "@/types";

export interface SellerSelectModalProps {
  table: Table | null;
  sellers: Seller[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSeller: (seller: Seller) => void;
  loading?: boolean;
}

export const SellerSelectModal = ({
  table,
  sellers,
  isOpen,
  onClose,
  onSelectSeller,
  loading = false,
}: SellerSelectModalProps) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Generate colors for seller buttons
  const getSellerColor = (index: number) => {
    const colors = [
      "from-[var(--gold-500)] to-[var(--gold-600)]",
      "from-[var(--teal-500)] to-[var(--teal-600)]",
      "from-purple-500 to-purple-600",
      "from-blue-500 to-blue-600",
      "from-pink-500 to-pink-600",
      "from-orange-500 to-orange-600",
      "from-green-500 to-green-600",
      "from-red-500 to-red-600",
    ];
    return colors[index % colors.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            <div className="card-glass rounded-xl shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                    Who&apos;s ordering?
                  </h2>
                  {table && (
                    <p className="text-[var(--muted-foreground)]">
                      Table {table.number}
                      {table.section && ` - ${table.section}`}
                    </p>
                  )}
                </div>

                {/* Seller Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--muted-foreground)]">Loading sellers...</p>
                  </div>
                ) : sellers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--muted-foreground)]">No sellers available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {sellers
                      .filter((s) => s.is_active)
                      .map((seller, index) => (
                        <motion.button
                          key={seller.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onSelectSeller(seller)}
                          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[var(--charcoal-800)] hover:bg-[var(--charcoal-700)] border-2 border-transparent hover:border-[var(--gold-500)]/50 transition-all group"
                        >
                          {/* Avatar */}
                          <div
                            className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSellerColor(
                              index
                            )} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                          >
                            {seller.avatar_url ? (
                              <img
                                src={seller.avatar_url}
                                alt={seller.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-white">
                                {getInitials(seller.name)}
                              </span>
                            )}
                          </div>

                          {/* Name */}
                          <span className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--gold-400)] transition-colors">
                            {seller.name}
                          </span>
                        </motion.button>
                      ))}
                  </div>
                )}

                {/* Open in New Tab Link */}
                {table && (
                  <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                    <a
                      href={`/seller/tables/${table.id}/tab`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in full seller view
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
