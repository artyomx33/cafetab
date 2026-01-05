'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTableByQR, useClientMenu, useCreateOrder, useProductWithModifiers } from '@/lib/supabase/hooks'
import { ArrowLeft, ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { ProductModal } from '@/components/ui/product-modal'
import type { Product, CartItem, ProductWithModifiers } from '@/types'

export default function MenuBrowser() {
  const params = useParams()
  const router = useRouter()
  const qrCode = params.qr as string
  const { table, tab } = useTableByQR(qrCode)
  const { categories, loading } = useClientMenu()
  const { createOrder, loading: submitting } = useCreateOrder(tab?.id || null)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch product with modifiers when a product is selected
  const { product: selectedProduct, loading: productLoading } = useProductWithModifiers(selectedProductId || '')

  // Set first category as selected when loaded
  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0].id)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProductId(null)
  }

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item])
    setShowCart(true)
  }

  const updateQuantity = (index: number, change: number) => {
    setCart(cart.map((item, i) => {
      if (i === index) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return item

        // Recalculate total price based on new quantity
        const pricePerUnit = item.totalPrice / item.quantity
        return { ...item, quantity: newQuantity, totalPrice: pricePerUnit * newQuantity }
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
      alert('No active tab found. Please contact staff.')
      return
    }

    try {
      await createOrder(cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
        modifiers: item.selectedModifiers.map(sm => ({
          modifier_id: sm.modifier.id,
          quantity: sm.quantity,
          price_adjustment: sm.modifier.price_adjustment
        })),
        unit_price: item.totalPrice / item.quantity
      })))

      alert('Order sent to kitchen!')
      setCart([])
      setShowCart(false)
      router.push(`/table/${qrCode}`)
    } catch (err) {
      alert('Failed to submit order. Please try again.')
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
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/table/${qrCode}`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-[#3E2723]" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#3E2723]">Menu</h1>
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
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#3E2723] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {selectedCategoryData && selectedCategoryData.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCategoryData.products.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all active:scale-98 text-left w-full"
              >
                {product.image_url && (
                  <div className="aspect-video bg-gradient-to-br from-[#FFF8E7] to-[#F5EBD7] relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-[#3E2723] mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#3E2723]">
                      {product.price_type === 'ask_server' ? 'Ask Server' : `$${product.price.toFixed(2)}`}
                    </span>
                    <div className="bg-gradient-to-r from-[#E07A5F] to-[#F4A261] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
                      <Plus size={18} />
                      View
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this category</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
          <div
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
                        {item.selectedModifiers.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {item.selectedModifiers.map((sm, idx) => (
                              <p key={idx} className="text-xs text-gray-600">
                                + {sm.modifier.name}
                                {sm.quantity > 1 && ` x${sm.quantity}`}
                                {sm.modifier.price_adjustment !== 0 &&
                                  ` (+$${(sm.modifier.price_adjustment * sm.quantity).toFixed(2)})`
                                }
                              </p>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">Note: {item.notes}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          ${(item.totalPrice / item.quantity).toFixed(2)} each
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
                      <div className="font-bold text-[#3E2723] w-20 text-right">
                        ${item.totalPrice.toFixed(2)}
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
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                {tab?.type === 'prepaid' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      {tab.balance >= cartTotal ? (
                        <>Will be deducted from your prepaid balance</>
                      ) : (
                        <>
                          <span className="font-semibold">Insufficient balance!</span>
                          <br />
                          Balance: ${tab.balance.toFixed(2)} | Order: ${cartTotal.toFixed(2)}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || (tab?.type === 'prepaid' && tab.balance < cartTotal)}
                className="w-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Order to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (when drawer closed) */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all active:scale-95 flex items-center gap-3 z-40"
        >
          <ShoppingCart size={24} />
          <div className="text-left">
            <div className="text-xs opacity-90">{cartItemCount} items</div>
            <div className="font-bold">${cartTotal.toFixed(2)}</div>
          </div>
        </button>
      )}

      {/* Product Modal */}
      {selectedProduct && !productLoading && (
        <ProductModal
          product={selectedProduct}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}
