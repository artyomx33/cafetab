"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ProductTile } from "@/components/ui/product-tile";
import { CategoryToggle } from "@/components/ui/category-toggle";
import { ProductModal } from "@/components/ui/product-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui";
import { IconBox } from "@/components/ui/icon-box";
import { useSellerStore } from "@/stores/seller-store";
import { useCartStore } from "@/stores/cart-store";
import { useCategories, useTabByTableId, useTableById, useProductWithModifiers, useCreateOrder } from "@/lib/supabase/hooks";
import type { Product, CartItem as TypeCartItem } from "@/types";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Receipt, CheckCircle, Trash2, Zap, Plus, ChevronUp } from "lucide-react";
import { CartReviewDrawer } from "@/components/ui/cart-review-drawer";

// Predefined favorites - popular items by name patterns (can be replaced with analytics later)
const FAVORITE_PATTERNS = [
  'water', 'beer', 'coffee', 'coke', 'cola', 'sprite', 'fanta',
  'wine', 'house', 'espresso', 'latte', 'americano', 'margarita',
  'nachos', 'fries', 'bread', 'edamame', 'gyoza'
];

export default function TableTabPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const tableId = params.tableId as string;

  const { seller, isLoggedIn } = useSellerStore();
  const { items, addItemWithModifiers, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const { table, loading: tableLoading } = useTableById(tableId);
  const { categories, loading: categoriesLoading } = useCategories();
  const { tab, loading: tabLoading, refresh: refreshTab, closeTab } = useTabByTableId(tableId);
  const { createOrder } = useCreateOrder(tab?.id || null);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAddingToTab, setIsAddingToTab] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showTabView, setShowTabView] = useState(false);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);

  // Fetch product with modifiers when a product is selected
  const { product: selectedProductWithModifiers, loading: productLoading } = useProductWithModifiers(selectedProductId || '');

  const isLoading = categoriesLoading || tabLoading || tableLoading;

  // Compute favorites from all products
  const favorites = useMemo(() => {
    if (!categories.length) return [];

    const allProducts = categories.flatMap(c => c.products);

    // Find products matching favorite patterns
    const matched = allProducts.filter(product =>
      FAVORITE_PATTERNS.some(pattern =>
        product.name.toLowerCase().includes(pattern)
      )
    );

    // If not enough matches, add cheap items (likely drinks/sides)
    if (matched.length < 6) {
      const cheapItems = allProducts
        .filter(p => !matched.includes(p) && p.price < 100)
        .slice(0, 6 - matched.length);
      return [...matched, ...cheapItems].slice(0, 8);
    }

    return matched.slice(0, 8);
  }, [categories]);

  // Quick add for simple items (no modifiers needed)
  const handleQuickAdd = (product: Product) => {
    // For simple items, add directly to cart
    const cartItem: TypeCartItem = {
      product,
      quantity: 1,
      totalPrice: product.price,
      selectedModifiers: [],
      notes: '',
    };
    addItemWithModifiers(cartItem);
    toast.success(`Added ${product.name}`);
  };

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
    setSelectedProductId(product.id);
  };

  const handleAddToCart = (cartItem: TypeCartItem) => {
    addItemWithModifiers(cartItem);
  };

  const handleAddAllToTab = async () => {
    if (!tab || !seller || items.length === 0) return;

    setIsAddingToTab(true);

    try {
      // Create order with all items - this creates order, order_items, tab_items and their modifiers
      const orderItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes || undefined,
        modifiers: item.modifiers.map(m => ({
          modifier_id: m.modifierId,
          quantity: m.quantity,
          price_adjustment: m.priceAdjustment,
        })),
        unit_price: item.totalPrice / item.quantity, // Include modifiers in unit price
      }));

      await createOrder(orderItems);
      await refreshTab();
      clearCart();
    } catch (err) {
      console.error("Failed to add items to tab:", err);
      toast.error("Failed to add items to tab. Please try again.");
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
      toast.error("Failed to close tab. Please try again.");
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
              {/* Speed Strip - Quick Favorites */}
              {favorites.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[var(--gold-400)]" />
                    <span className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Quick Add
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {favorites.map((product, index) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleQuickAdd(product)}
                        className="flex-shrink-0 bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] hover:from-[var(--gold-400)] hover:to-[var(--gold-500)] text-white px-4 py-2 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        {product.name.length > 15 ? product.name.slice(0, 15) + '...' : product.name}
                        <span className="opacity-75">${product.price.toFixed(0)}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

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
                            hasModifiers={product.has_modifiers ?? true}
                            onQuickAdd={!product.has_modifiers ? () => handleQuickAdd(product) : undefined}
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

      {/* Bottom Bar - Compact Cart Summary (tap to review) */}
      {!showTabView && cartItemCount > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 glass border-t-2 border-[var(--gold-500)] shadow-lg glow-gold cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowReviewDrawer(true)}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--gold-500)] text-[var(--charcoal-900)] rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {cartItemCount}
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                </p>
                <p className="text-xl font-bold text-gradient-gold font-serif">
                  ${cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--gold-400)]">
              <span className="text-sm font-medium">Review Order</span>
              <ChevronUp className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Cart Review Drawer */}
      <CartReviewDrawer
        isOpen={showReviewDrawer}
        onClose={() => setShowReviewDrawer(false)}
        items={items}
        tableNumber={table?.number}
        tableName={table?.section ?? undefined}
        total={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onEditItem={(item) => {
          // Close drawer, open product modal for editing
          setShowReviewDrawer(false);
          // Find original product to get full data
          const category = categories.find(c =>
            c.products.some(p => p.id === item.productId)
          );
          if (category) {
            const product = category.products.find(p => p.id === item.productId);
            if (product) {
              setSelectedProductId(product.id);
            }
          }
        }}
        onConfirm={async () => {
          await handleAddAllToTab();
          setShowReviewDrawer(false);
        }}
        isSubmitting={isAddingToTab}
      />

      {/* Product Modal with Modifiers */}
      {selectedProductWithModifiers && !productLoading && (
        <ProductModal
          product={selectedProductWithModifiers}
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
