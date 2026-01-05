"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import { ProductTile } from "@/components/ui/product-tile";
import { CategoryToggle } from "@/components/ui/category-toggle";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useSellerStore } from "@/stores/seller-store";
import { useCartStore } from "@/stores/cart-store";
import { useCategories, useTab } from "@/lib/supabase/hooks";
import type { Product } from "@/types";

export default function SellerGroupItemsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { seller, isLoggedIn } = useSellerStore();
  const { items, addItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const { categories, loading: categoriesLoading } = useCategories();
  const { tab, loading: tabLoading, refresh: refreshTab, addItem: addItemToTab } = useTab(groupId);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Product selection dialog
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAddingToTab, setIsAddingToTab] = useState(false);

  const isLoading = categoriesLoading || tabLoading;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/seller");
    }
  }, [isLoggedIn, isLoading, router]);

  // Expand all categories by default
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(new Set(categories.map((c) => c.id)));
    }
  }, [categories]);

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
    setSelectedProduct(product);
    setSelectedQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Add to cart store for the bottom bar display
    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitPrice: selectedProduct.price,
    });

    // Update quantity if already in cart
    const existingItem = items.find((i) => i.productId === selectedProduct.id);
    if (existingItem) {
      updateQuantity(selectedProduct.id, existingItem.quantity + selectedQuantity);
    } else {
      updateQuantity(selectedProduct.id, selectedQuantity);
    }

    // Close dialog
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const handleAddAllToTab = async () => {
    if (!tab || !seller || items.length === 0) return;

    setIsAddingToTab(true);

    try {
      // Add each item to the tab
      for (const item of items) {
        await addItemToTab(item.productId, item.quantity, seller.id);
      }

      // Refresh tab data to get updated total
      await refreshTab();

      // Clear cart
      clearCart();
    } catch (err) {
      console.error("Failed to add items to tab:", err);
      alert("Failed to add items to tab. Please try again.");
    } finally {
      setIsAddingToTab(false);
    }
  };

  const handleViewTab = () => {
    router.push(`/seller/groups/${groupId}/tab`);
  };

  if (!isLoggedIn) {
    return null;
  }

  const cartTotal = getTotal();
  const cartItemCount = getItemCount();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <motion.div
        className="glass border-b border-[var(--card-border)] px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Add Items
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="default"
              onClick={handleViewTab}
            >
              View Tab
            </Button>
            <button
              onClick={() => router.back()}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Back
            </button>
          </div>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Group ID: {groupId.slice(0, 6).toUpperCase()}
        </p>
        <p className="text-lg font-bold text-gradient-gold">
          Tab Total: ${tab?.total.toFixed(2) || '0.00'}
        </p>
      </motion.div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[var(--muted-foreground)]">Loading products...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                {/* Category Toggle */}
                <CategoryToggle
                  categoryName={category.name}
                  isExpanded={expandedCategories.has(category.id)}
                  itemCount={category.products.length}
                  onClick={() => toggleCategory(category.id)}
                  className="mb-3"
                />

                {/* Products Grid */}
                {expandedCategories.has(category.id) && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {category.products.map((product, prodIndex) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: prodIndex * 0.05 }}
                      >
                        <ProductTile
                          name={product.name}
                          price={product.price}
                          imageUrl={product.image_url || undefined}
                          onClick={() => handleProductClick(product)}
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

      {/* Bottom Bar - Cart Summary */}
      {cartItemCount > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 glass border-t-2 border-[var(--gold-500)] shadow-lg px-6 py-4 glow-gold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </p>
              <p className="text-2xl font-bold text-gradient-gold font-serif">
                ${cartTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleViewTab}
                className="flex-1"
              >
                View Tab
              </Button>
              <Button
                onClick={handleAddAllToTab}
                disabled={isAddingToTab}
                className="flex-1"
              >
                {isAddingToTab ? "Adding..." : "Add to Tab"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Selection Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent
            title={selectedProduct.name}
            description={`$${selectedProduct.price.toFixed(2)} each`}
          >
            <DialogClose onClick={() => setSelectedProduct(null)} />

            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex justify-center">
                <QuantitySelector
                  value={selectedQuantity}
                  onChange={setSelectedQuantity}
                  min={1}
                  max={99}
                />
              </div>

              {/* Total */}
              <div className="text-center">
                <p className="text-sm mb-1 text-[var(--muted-foreground)]">
                  Total
                </p>
                <p className="text-3xl font-bold text-gradient-gold font-serif">
                  ${(selectedProduct.price * selectedQuantity).toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddToCart} className="flex-1">
                  Add to Cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
