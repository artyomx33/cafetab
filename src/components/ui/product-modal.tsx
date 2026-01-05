"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductWithModifiers, CartItem, SelectedModifier, Modifier } from "@/types";
import { Button } from "./button";
import { Input } from "./input";

export interface ProductModalProps {
  product: ProductWithModifiers;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) => {
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [selectedModifiers, setSelectedModifiers] = React.useState<
    Map<string, SelectedModifier>
  >(new Map());

  // Initialize default modifiers when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const defaults = new Map<string, SelectedModifier>();

      product.modifier_groups.forEach((group) => {
        group.modifiers.forEach((modifier) => {
          if (modifier.is_default && modifier.is_active) {
            defaults.set(modifier.id, {
              modifier,
              quantity: 1,
            });
          }
        });
      });

      setSelectedModifiers(defaults);
      setQuantity(1);
      setNotes("");
    }
  }, [isOpen, product]);

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

  const handleModifierToggle = (
    modifier: Modifier,
    groupType: "single" | "multi",
    groupId: string
  ) => {
    const newSelected = new Map(selectedModifiers);

    if (groupType === "single") {
      // Remove all modifiers from this group first
      product.modifier_groups
        .find((g) => g.id === groupId)
        ?.modifiers.forEach((m) => {
          newSelected.delete(m.id);
        });

      // Add the selected one
      newSelected.set(modifier.id, {
        modifier,
        quantity: 1,
      });
    } else {
      // Multi-select: toggle
      if (newSelected.has(modifier.id)) {
        newSelected.delete(modifier.id);
      } else {
        newSelected.set(modifier.id, {
          modifier,
          quantity: 1,
        });
      }
    }

    setSelectedModifiers(newSelected);
  };

  const calculateTotal = (): number => {
    let total = product.price;

    selectedModifiers.forEach((selected) => {
      total += selected.modifier.price_adjustment * selected.quantity;
    });

    return total * quantity;
  };

  const isRequiredGroupSatisfied = (
    group: ProductWithModifiers["modifier_groups"][0]
  ): boolean => {
    if (!group.is_required) return true;

    const selectedInGroup = Array.from(selectedModifiers.values()).filter(
      (sm) => sm.modifier.group_id === group.id
    );

    if (selectedInGroup.length < group.min_select) return false;
    if (group.max_select && selectedInGroup.length > group.max_select)
      return false;

    return true;
  };

  const canAddToCart = (): boolean => {
    if (product.price_type === "ask_server") return true;

    return product.modifier_groups.every((group) =>
      isRequiredGroupSatisfied(group)
    );
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;

    const cartItem: CartItem = {
      product,
      quantity,
      selectedModifiers: Array.from(selectedModifiers.values()),
      notes,
      totalPrice: calculateTotal(),
    };

    onAddToCart(cartItem);
    onClose();
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
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
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl mx-4 mb-4 sm:mb-0 max-h-[90vh] overflow-y-auto"
          >
            <div className="card-glass rounded-xl shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>

              {/* Header with Image */}
              {product.image_url && (
                <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-t-xl">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Product Info */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="text-[var(--muted-foreground)] text-base mb-3">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xl font-semibold text-[var(--primary)]">
                    {product.price_type === "ask_server"
                      ? "Price upon request"
                      : formatPrice(product.price)}
                  </p>
                </div>

                {/* Modifier Groups */}
                {product.modifier_groups.length > 0 && (
                  <div className="space-y-6">
                    {product.modifier_groups.map((group) => (
                      <div key={group.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {group.name}
                          </h3>
                          <span
                            className={cn(
                              "text-sm px-2 py-1 rounded",
                              group.is_required
                                ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                            )}
                          >
                            {group.is_required ? "Required" : "Optional"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {group.modifiers
                            .filter((m) => m.is_active)
                            .map((modifier) => {
                              const isSelected = selectedModifiers.has(
                                modifier.id
                              );

                              if (group.type === "single") {
                                return (
                                  <label
                                    key={modifier.id}
                                    className={cn(
                                      "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                                      isSelected
                                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                                        : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name={`group-${group.id}`}
                                        checked={isSelected}
                                        onChange={() =>
                                          handleModifierToggle(
                                            modifier,
                                            "single",
                                            group.id
                                          )
                                        }
                                        className="w-5 h-5 text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-2"
                                      />
                                      <span className="text-base text-[var(--foreground)]">
                                        {modifier.name}
                                      </span>
                                    </div>
                                    {modifier.price_adjustment !== 0 && (
                                      <span className="text-sm font-medium text-[var(--primary)]">
                                        {modifier.price_adjustment > 0
                                          ? "+"
                                          : ""}
                                        {formatPrice(modifier.price_adjustment)}
                                      </span>
                                    )}
                                  </label>
                                );
                              }

                              // Multi-select checkboxes
                              return (
                                <label
                                  key={modifier.id}
                                  className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    isSelected
                                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                                      : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleModifierToggle(
                                          modifier,
                                          "multi",
                                          group.id
                                        )
                                      }
                                      className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-2"
                                    />
                                    <span className="text-base text-[var(--foreground)]">
                                      {modifier.name}
                                    </span>
                                  </div>
                                  {modifier.price_adjustment !== 0 && (
                                    <span className="text-sm font-medium text-[var(--primary)]">
                                      {modifier.price_adjustment > 0 ? "+" : ""}
                                      {formatPrice(modifier.price_adjustment)}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="notes"
                    className="block text-base font-medium text-[var(--foreground)]"
                  >
                    Special Requests
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or modifications?"
                    rows={3}
                    className={cn(
                      "flex w-full rounded-lg border px-4 py-3",
                      "border-[var(--input-border)] bg-[var(--input-bg)]",
                      "text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                      "focus-visible:border-[var(--primary)]",
                      "transition-all duration-200 resize-none"
                    )}
                  />
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-[var(--foreground)]">
                    Quantity
                  </span>
                  <div className="flex items-center gap-4 rounded-lg border-2 border-[var(--card-border)] bg-[var(--card)] p-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        "bg-[var(--muted)] text-[var(--foreground)] text-xl font-bold",
                        "hover:bg-[var(--muted)]/80",
                        "active:scale-95",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        "transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      )}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-5 w-5" />
                    </button>

                    <span className="text-2xl font-bold text-[var(--foreground)] min-w-[3rem] text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        "bg-[var(--primary)] text-[var(--primary-foreground)] text-xl font-bold",
                        "hover:opacity-90",
                        "active:scale-95",
                        "transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      )}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Running Total */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {product.price_type === "ask_server"
                      ? "TBD"
                      : formatPrice(calculateTotal())}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart()}
                  className="w-full"
                  size="large"
                >
                  {product.price_type === "ask_server"
                    ? "Request Price"
                    : `Add to Cart - ${formatPrice(calculateTotal())}`}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
