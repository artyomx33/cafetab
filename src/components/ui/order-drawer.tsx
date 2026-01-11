"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, Trash2, ChefHat } from "lucide-react";
import { ProductTile } from "./product-tile";
import { CategoryToggle } from "./category-toggle";
import { ProductModal } from "./product-modal";
import { Button } from "./button";
import { useCategories, useProductWithModifiers, useCreateOrder } from "@/lib/supabase/hooks";
import { useCartStore } from "@/stores/cart-store";
import type { Product, CartItem as TypeCartItem, Seller, Tab, Table } from "@/types";
import { useToast } from "@/components/ui/toast";

export interface OrderDrawerProps {
  table: Table | null;
  tab: Tab | null;
  seller: Seller | null;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onOrderComplete: () => void;
}

export const OrderDrawer = ({
  table,
  tab,
  seller,
  isOpen,
  onClose,
  onBack,
  onOrderComplete,
}: OrderDrawerProps) => {
  const toast = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const { createOrder } = useCreateOrder(tab?.id || null);
  const { items, addItemWithModifiers, removeItem, clearCart, getTotal, getItemCount } = useCartStore();

  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [isAddingToTab, setIsAddingToTab] = React.useState(false);

  // Fetch product with modifiers when selected
  const { product: selectedProductWithModifiers, loading: productLoading } = useProductWithModifiers(selectedProductId || "");

  // Lock body scroll when drawer is open
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

  // Expand all categories by default
  React.useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(new Set(categories.map((c) => c.id)));
    }
  }, [categories]);

  // Clear cart when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      clearCart();
    }
  }, [isOpen, clearCart]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
  };

  const handleAddToCart = (cartItem: TypeCartItem) => {
    addItemWithModifiers(cartItem);
  };

  // Quick add for products without modifiers
  const handleQuickAdd = (product: Product) => {
    addItemWithModifiers({
      product,
      quantity: 1,
      selectedModifiers: [],
      notes: "",
      totalPrice: product.price,
    });
  };

  const handleSendToKitchen = async () => {
    if (!tab || !seller || items.length === 0) return;

    setIsAddingToTab(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes || undefined,
        modifiers: item.modifiers.map((m) => ({
          modifier_id: m.modifierId,
          quantity: m.quantity,
          price_adjustment: m.priceAdjustment,
        })),
        unit_price: item.totalPrice / item.quantity,
      }));

      await createOrder(orderItems);
      clearCart();
      onOrderComplete();
    } catch (err) {
      console.error("Failed to send order to kitchen:", err);
      toast.error("Failed to send order. Please try again.");
    } finally {
      setIsAddingToTab(false);
    }
  };

  const cartTotal = getTotal();
  const cartItemCount = getItemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl h-full bg-[var(--background)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-[var(--card)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Table {table?.number || "?"}
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Ordering as {seller?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-[var(--muted-foreground)]">Loading menu...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category, catIndex) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.05 }}
                    >
                      <CategoryToggle
                        categoryName={category.name}
                        isExpanded={expandedCategories.has(category.id)}
                        itemCount={category.products.length}
                        onClick={() => toggleCategory(category.id)}
                        className="mb-3"
                      />

                      {expandedCategories.has(category.id) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                          {category.products.map((product, prodIndex) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: prodIndex * 0.02 }}
                            >
                              <ProductTile
                                name={product.name}
                                price={product.price}
                                imageUrl={product.image_url || undefined}
                                hasModifiers={product.has_modifiers ?? true}
                                onClick={() => handleProductClick(product)}
                                onQuickAdd={() => handleQuickAdd(product)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItemCount > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="border-t-2 border-[var(--gold-500)] bg-[var(--card)] p-4 shadow-lg"
              >
                {/* Cart Items */}
                <div className="max-h-40 overflow-y-auto mb-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-[var(--foreground)]">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.modifiers.length > 0 && (
                          <span className="text-[var(--muted-foreground)] ml-1">
                            ({item.modifiers.map((m) => m.modifierName).join(", ")})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--gold-400)]">${item.totalPrice.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total and Send Button */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[var(--card-border)]">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                    </p>
                    <p className="text-2xl font-bold text-gradient-gold font-serif">
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={handleSendToKitchen}
                    disabled={isAddingToTab}
                    size="large"
                    className="gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    {isAddingToTab ? "Sending..." : "Send to Kitchen"}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProductWithModifiers && !productLoading && (
        <ProductModal
          product={selectedProductWithModifiers}
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </AnimatePresence>
  );
};
