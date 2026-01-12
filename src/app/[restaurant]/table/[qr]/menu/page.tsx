'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useClientMenu, useCreateOrder, useProductWithModifiers, useActivePromotions } from '@/lib/supabase/hooks'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useToast } from '@/components/ui/toast'
import { ProductModal } from '@/components/ui/product-modal'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { CartItem, Product } from '@/types'

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  // Food
  'starters': '🥗',
  'specials': '⭐',
  'specials - camote relleno': '🍠',
  'tacos (3 pz.)': '🌮',
  'tacos': '🌮',
  'aguachile de ribeye': '🦐',
  'aguachile': '🦐',
  'patadas (2 pz.)': '🫓',
  'patadas': '🫓',
  'the best burrito': '🌯',
  'burrito': '🌯',
  "chef's dessert": '🍰',
  'dessert': '🍰',
  // Drinks
  'classic cocktails': '🍹',
  'cocktails': '🍹',
  'soft drinks': '🥤',
  'beverages': '🥤',
  'beers': '🍺',
  'beer': '🍺',
  'mezcal': '🥃',
  'tequila': '🥃',
  'ron': '🥃',
  'rum': '🥃',
  'vodka': '🍸',
  'gin': '🍸',
  'whisky': '🥃',
  'whiskey': '🥃',
  // Green Vibes
  'salad bar': '🥗',
  'salad bases': '🥬',
  'proteins': '🍗',
  'premium vegetables': '🥑',
  'garnish': '🫒',
  'juices (500ml)': '🧃',
  'smoothies (500ml)': '🥤',
  'coffee shop (335ml)': '☕',
  // Fallbacks
  'default': '☕',
}

function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase()
  return categoryEmojis[key] || categoryEmojis['default']
}

export default function MenuBrowser() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const qrCode = params.qr as string

  const { restaurant, restaurantId, slug, formatPrice, loading: restaurantLoading } = useRestaurant()

  // Database hooks
  const { table, tab } = useTableByQR(qrCode)
  const { categories: dbCategories, loading: menuLoading } = useClientMenu(restaurantId || undefined)
  const { createOrder, loading: submitting } = useCreateOrder(tab?.id || null)
  const { getBestPromotionForProduct, calculateDiscountedPrice, loading: promosLoading } = useActivePromotions(restaurantId || '')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  // Modal state for products with modifiers
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch product with modifiers when modal is open
  const { product: productWithModifiers, loading: productLoading } = useProductWithModifiers(
    selectedProductId || ''
  )

  // Map categories with has_modifiers flag preserved
  const categories = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    products: c.products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description || undefined,
      has_modifiers: p.has_modifiers || false,
    })),
  }))

  const loading = restaurantLoading || menuLoading || promosLoading

  // Set first category as selected when loaded
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  // Handle product click - open modal if has modifiers, otherwise quick add
  const handleProductClick = (product: { id: string; name: string; price: number; description?: string; has_modifiers: boolean }) => {
    if (product.has_modifiers) {
      setSelectedProductId(product.id)
      setModalOpen(true)
    } else {
      handleQuickAdd(product, selectedCategory || '')
    }
  }

  // Quick add for products without modifiers
  const handleQuickAdd = (product: { id: string; name: string; price: number; description?: string }, categoryId: string) => {
    // Check for promotion and get effective price
    const promo = getBestPromotionForProduct(product.id, categoryId, product.price)
    const effectivePrice = promo ? calculateDiscountedPrice(product.price, promo) : product.price

    const existingIndex = cart.findIndex(item =>
      item.product.id === product.id && item.selectedModifiers.length === 0
    )

    if (existingIndex >= 0) {
      setCart(cart.map((item, i) =>
        i === existingIndex
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * effectivePrice }
          : item
      ))
    } else {
      const cartItem: CartItem = {
        product: { ...product, price: effectivePrice } as Product,
        quantity: 1,
        selectedModifiers: [],
        notes: '',
        totalPrice: effectivePrice,
      }
      setCart([...cart, cartItem])
    }

    const promoText = promo && promo.badge_text ? ` (${promo.badge_text})` : ''
    toast.success(`Added ${product.name}${promoText}`)
  }

  // Add to cart from modal (with modifiers)
  const handleAddToCartFromModal = (item: CartItem) => {
    setCart([...cart, item])
    setModalOpen(false)
    setSelectedProductId(null)
    toast.success(`Added ${item.product.name}`)
  }

  const updateQuantity = (index: number, change: number) => {
    setCart(cart.map((item, i) => {
      if (i === index) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return item

        // Recalculate total with modifiers
        const modifierTotal = item.selectedModifiers.reduce(
          (sum, sm) => sum + sm.modifier.price_adjustment * sm.quantity, 0
        )
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * (item.product.price + modifierTotal)
        }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    if (!tab) {
      toast.error('No active tab. Please open a tab first.')
      router.push(`/${slug}/table/${qrCode}`)
      return
    }

    try {
      await createOrder(cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        notes: item.notes || undefined,
        modifiers: item.selectedModifiers.map(sm => ({
          modifier_id: sm.modifier.id,
          quantity: sm.quantity,
          price_adjustment: sm.modifier.price_adjustment,
        })),
      })))

      toast.success('Order sent to kitchen!')
      setCart([])
      setShowCart(false)
      router.push(`/${slug}/table/${qrCode}`)
    } catch {
      toast.error('Failed to submit order. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E2723] mx-auto mb-4" />
          <p className="text-[#3E2723]">Loading menu...</p>
        </div>
      </div>
    )
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-[#FFF8F0] to-[#FAEBD7]">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/${slug}/table/${qrCode}`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-[#3E2723]" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#3E2723]">{restaurant?.name || slug}</h1>
            {table && <p className="text-sm text-gray-600">Table {table.number}</p>}
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ShoppingCart size={24} className="text-[#3E2723]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E07A5F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
          {categories.map(category => {
            const emoji = getCategoryEmoji(category.name)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-[#3E2723] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{emoji}</span>
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {selectedCategoryData && selectedCategoryData.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCategoryData.products.map(product => {
              const emoji = getCategoryEmoji(selectedCategoryData.name)
              const promo = getBestPromotionForProduct(product.id, selectedCategoryData.id, product.price)
              const discountedPrice = promo ? calculateDiscountedPrice(product.price, promo) : null

              return (
                <motion.button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all text-left w-full relative"
                >
                  {/* Promotion Badge */}
                  {promo && promo.badge_text && (
                    <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {promo.badge_text}
                    </div>
                  )}

                  {/* Visual Header */}
                  <div className={`h-20 relative ${promo ? 'bg-gradient-to-br from-rose-100 to-orange-100' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-50">{emoji}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-[#3E2723] mb-1 line-clamp-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {discountedPrice !== null && discountedPrice !== product.price ? (
                          <>
                            <span className="text-xl font-bold text-[#E07A5F]">
                              {formatPrice(discountedPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-[#3E2723]">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1 text-sm ${
                        product.has_modifiers
                          ? 'bg-[#3E2723] text-white'
                          : 'bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white'
                      }`}>
                        {product.has_modifiers ? (
                          <>Customize</>
                        ) : (
                          <><Plus size={16} /> Add</>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this category</p>
          </div>
        )}
      </div>

      {/* Product Modal for items with modifiers */}
      {productWithModifiers && !productLoading && (
        <ProductModal
          product={productWithModifiers}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedProductId(null)
          }}
          onAddToCart={handleAddToCartFromModal}
        />
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && cart.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Cart Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#3E2723]">Your Order</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#3E2723]">{item.product.name}</h3>
                          {/* Show selected modifiers */}
                          {item.selectedModifiers.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.selectedModifiers.map((sm, idx) => (
                                <p key={idx} className="text-xs text-gray-500">
                                  + {sm.modifier.name}
                                  {sm.modifier.price_adjustment > 0 && (
                                    <span className="text-[#E07A5F]"> (+{formatPrice(sm.modifier.price_adjustment)})</span>
                                  )}
                                </p>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-400 mt-1 italic">Note: {item.notes}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {formatPrice(item.totalPrice / item.quantity)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="font-bold text-[#3E2723] w-24 text-right">
                          {formatPrice(item.totalPrice)}
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg text-gray-600">Total:</span>
                    <span className="text-3xl font-bold text-[#3E2723]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  {!tab && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        You need to open a tab before ordering. Go back and open a tab first.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !tab}
                  className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : tab ? 'Submit Order to Kitchen' : 'Open Tab First'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all active:scale-95 flex items-center gap-3 z-40"
        >
          <ShoppingCart size={24} />
          <div className="text-left">
            <div className="text-xs opacity-90">{cartItemCount} items</div>
            <div className="font-bold">{formatPrice(cartTotal)}</div>
          </div>
        </button>
      )}
    </div>
  )
}
