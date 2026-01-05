"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ProductTile } from "@/components/ui/product-tile";
import { CategoryToggle } from "@/components/ui/category-toggle";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui";
import { IconBox } from "@/components/ui/icon-box";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useSellerStore } from "@/stores/seller-store";
import { useCartStore } from "@/stores/cart-store";
import { useCategories, useTabByTableId, useTableById } from "@/lib/supabase/hooks";
import type { Product } from "@/types";
import { ArrowLeft, Receipt, CheckCircle } from "lucide-react";

export default function TableTabPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const { seller, isLoggedIn } = useSellerStore();
  const { items, addItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const { table, loading: tableLoading } = useTableById(tableId);
  const { categories, loading: categoriesLoading } = useCategories();
  const { tab, loading: tabLoading, refresh: refreshTab, addItem: addItemToTab, closeTab } = useTabByTableId(tableId);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAddingToTab, setIsAddingToTab] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showTabView, setShowTabView] = useState(false);

  const isLoading = categoriesLoading || tabLoading || tableLoading;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/seller");
    }
  }, [isLoggedIn, isLoading, router]);

  // Redirect if no tab
  useEffect(() => {
    if (!tabLoading && !tab) {
      router.push(`/seller/tables/${tableId}`);
    }
  }, [tab, tabLoading, tableId, router]);

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

    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitPrice: selectedProduct.price,
    });

    const existingItem = items.find((i) => i.productId === selectedProduct.id);
    if (existingItem) {
      updateQuantity(selectedProduct.id, existingItem.quantity + selectedQuantity);
    } else {
      updateQuantity(selectedProduct.id, selectedQuantity);
    }

    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const handleAddAllToTab = async () => {
    if (!tab || !seller || items.length === 0) return;

    setIsAddingToTab(true);

    try {
      for (const item of items) {
        await addItemToTab(item.productId, item.quantity, seller.id);
      }

      await refreshTab();
      clearCart();
    } catch (err) {
      console.error("Failed to add items to tab:", err);
      alert("Failed to add items to tab. Please try again.");
    } finally {
      setIsAddingToTab(false);
    }
  };

  const handleCloseTab = async () => {
    if (!tab) return;

    setIsClosing(true);
    try {
      const success = await closeTab();
      if (success) {
        router.push("/seller/tables");
      }
    } catch (err) {
      alert("Failed to close tab. Please try again.");
    } finally {
      setIsClosing(false);
    }
  };

  if (!isLoggedIn || !tab) {
    return null;
  }

  const cartTotal = getTotal();
  const cartItemCount = getItemCount();
  const isPrepaid = tab.type === 'prepaid';

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <motion.div
        className="glass border-b border-[var(--card-border)] px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/seller/tables/${tableId}`)}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Table {table?.number || tableId}
            </h2>
            {table?.section && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {table.section}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="default"
            onClick={() => setShowTabView(!showTabView)}
          >
            {showTabView ? "Add Items" : "View Tab"}
          </Button>
        </div>

        {/* Tab Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isPrepaid ? 'Prepaid Tab' : 'Regular Tab'}
            </p>
            <p className="text-lg font-bold text-gradient-gold">
              Total: ${tab.total.toFixed(2)}
            </p>
          </div>
          {isPrepaid && (
            <div className="text-right">
              <p className="text-sm text-[var(--muted-foreground)]">Balance</p>
              <p className={`text-xl font-bold ${tab.balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                ${tab.balance.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content - Toggle between Add Items and View Tab */}
      {showTabView ? (
        /* View Tab */
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="card-glass mb-4">
              <div className="p-4 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2">
                  <IconBox color="gold" size="sm">
                    <Receipt className="w-4 h-4" />
                  </IconBox>
                  <span className="font-semibold text-[var(--foreground)]">
                    Tab Items
                  </span>
                </div>
              </div>

              {tab.tab_items.length === 0 ? (
                <div className="p-8 text-center text-[var(--muted-foreground)]">
                  No items yet
                </div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {tab.tab_items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="p-4 flex justify-between items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {item.product?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gradient-gold">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Close Tab Button */}
            <Button
              onClick={handleCloseTab}
              disabled={isClosing || tab.tab_items.length === 0}
              className="w-full"
              size="large"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isClosing ? "Closing..." : "Close Tab"}
            </Button>
          </motion.div>
        </div>
      ) : (
        /* Add Items */
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
                  <CategoryToggle
                    categoryName={category.name}
                    isExpanded={expandedCategories.has(category.id)}
                    itemCount={category.products.length}
                    onClick={() => toggleCategory(category.id)}
                    className="mb-3"
                  />

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
      )}

      {/* Bottom Bar - Cart Summary (only show when adding items) */}
      {!showTabView && cartItemCount > 0 && (
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
            <Button
              onClick={handleAddAllToTab}
              disabled={isAddingToTab}
              size="large"
            >
              {isAddingToTab ? "Adding..." : "Add to Tab"}
            </Button>
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
              <div className="flex justify-center">
                <QuantitySelector
                  value={selectedQuantity}
                  onChange={setSelectedQuantity}
                  min={1}
                  max={99}
                />
              </div>

              <div className="text-center">
                <p className="text-sm mb-1 text-[var(--muted-foreground)]">
                  Total
                </p>
                <p className="text-3xl font-bold text-gradient-gold font-serif">
                  ${(selectedProduct.price * selectedQuantity).toFixed(2)}
                </p>
              </div>

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
