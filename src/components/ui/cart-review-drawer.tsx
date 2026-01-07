"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X, Minus, Plus, StickyNote, Trash2, Loader2 } from "lucide-react";
import type { CartItem } from "@/stores/cart-store";

interface CartReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber?: string;
  tableName?: string;
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem?: (item: CartItem) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function CartReviewDrawer({
  isOpen,
  onClose,
  items,
  tableNumber,
  tableName,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onConfirm,
  isSubmitting = false,
}: CartReviewDrawerProps) {
  const [expandedNotes, setExpandedNotes] = React.useState<Set<string>>(new Set());

  const toggleNotes = (itemId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-[var(--charcoal-900)] rounded-t-3xl",
              "border-t-2 border-[var(--gold-500)]",
              "max-h-[85vh] flex flex-col"
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  Review Order
                </h2>
                {/* Table Reminder - Luna's rule */}
                {(tableNumber || tableName) && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Adding to: Table {tableNumber}
                    {tableName && ` · ${tableName}`}
                  </p>
                )}
              </div>
              <div className="w-9" /> {/* Spacer for alignment */}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No items in cart
                </div>
              ) : (
                items.map((item) => {
                  const hasModifiers = item.modifiers.length > 0;
                  const hasNotes = item.notes && item.notes.trim().length > 0;
                  const notesExpanded = expandedNotes.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      className="bg-[var(--charcoal-800)] rounded-xl p-4 border border-[var(--card-border)]"
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      {/* Item Row */}
                      <div className="flex items-start gap-3">
                        {/* Quantity Controls - inline for simple items (Luna's hybrid rule) */}
                        {!hasModifiers ? (
                          <div className="flex items-center gap-1 bg-[var(--charcoal-700)] rounded-lg">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-white/10 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </button>
                            <span className="w-8 text-center font-bold text-[var(--foreground)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-white/10 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-[var(--charcoal-700)] rounded-lg flex items-center justify-center">
                            <span className="font-bold text-[var(--foreground)]">
                              {item.quantity}x
                            </span>
                          </div>
                        )}

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-semibold text-[var(--foreground)]">
                                {item.productName}
                              </span>
                              {/* Notes icon - collapsed by default (Luna's rule) */}
                              {hasNotes && (
                                <button
                                  onClick={() => toggleNotes(item.id)}
                                  className="ml-2 text-[var(--gold-400)] hover:text-[var(--gold-300)]"
                                  title="View notes"
                                >
                                  <StickyNote className="w-4 h-4 inline" />
                                </button>
                              )}
                            </div>
                            <span className="font-bold text-[var(--gold-400)] whitespace-nowrap">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Modifiers */}
                          {hasModifiers && (
                            <div className="mt-1 space-y-0.5">
                              {item.modifiers.map((mod, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm text-[var(--muted-foreground)]"
                                >
                                  + {mod.quantity > 1 ? `${mod.quantity}x ` : ""}{mod.modifierName}
                                  {mod.priceAdjustment > 0 && (
                                    <span className="text-[var(--gold-400)]/70 ml-1">
                                      +${(mod.priceAdjustment * mod.quantity).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Expanded Notes */}
                          <AnimatePresence>
                            {hasNotes && notesExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 p-2 bg-[var(--gold-500)]/10 border border-[var(--gold-500)]/30 rounded-lg">
                                  <p className="text-sm text-[var(--gold-300)]">
                                    {item.notes}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Actions */}
                          <div className="mt-2 flex gap-2">
                            {/* Edit button - only for items with modifiers (Luna's hybrid rule) */}
                            {hasModifiers && onEditItem && (
                              <button
                                onClick={() => onEditItem(item)}
                                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer - thumb zone friendly (Luna's rule) */}
            <div className="p-4 border-t border-[var(--card-border)] bg-[var(--charcoal-900)]">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--muted-foreground)]">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="text-2xl font-bold text-gradient-gold font-serif">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Confirm Button - prevents double submission (Luna's rule) */}
              <Button
                onClick={onConfirm}
                disabled={isSubmitting || items.length === 0}
                className="w-full"
                size="large"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding to Tab...
                  </>
                ) : (
                  "Add to Tab"
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
