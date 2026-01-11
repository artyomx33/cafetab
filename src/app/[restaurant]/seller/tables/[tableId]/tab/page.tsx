'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui'
import { useSellerStore } from '@/stores/seller-store'
import { useDemoStore } from '@/stores/demo-store'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, Plus, Minus, ShoppingCart, Receipt, CheckCircle } from 'lucide-react'

export default function TableTabPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const tableId = params.tableId as string

  const { restaurant, slug, usesDatabase, formatPrice, getCategories, getTables } = useRestaurant()
  const { isLoggedIn } = useSellerStore()

  // Demo mode store
  const { tables: demoTables, initializeRestaurant, addToTab, closeTab: demoCloseTab } = useDemoStore()

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [showTabView, setShowTabView] = useState(false)

  // Initialize demo store
  useEffect(() => {
    if (!usesDatabase) {
      initializeRestaurant(slug, getTables())
    }
  }, [usesDatabase, slug, getTables, initializeRestaurant])

  // Get data
  const demoTable = !usesDatabase ? demoTables.find(t => t.id === tableId) : null
  const table = demoTable
  const tab = demoTable?.current_tab
  const categories = getCategories()

  // Expand first category by default
  useEffect(() => {
    if (!expandedCategory && categories.length > 0) {
      setExpandedCategory(categories[0].id)
    }
  }, [categories, expandedCategory])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/${slug}/seller`)
    }
  }, [isLoggedIn, router, slug])

  // Redirect if no tab
  useEffect(() => {
    if (!usesDatabase && table && !tab) {
      router.push(`/${slug}/seller/tables/${tableId}`)
    }
  }, [tab, table, tableId, router, slug, usesDatabase])

  if (usesDatabase) {
    // For database mode, redirect to the original page
    router.push(`/seller/tables/${tableId}/tab`)
    return null
  }

  if (!isLoggedIn || !tab) {
    return null
  }

  const addToCart = (product: { id: string; name: string; price: number }) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success(`Added ${product.name}`)
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id !== productId) return item
      const newQty = item.quantity + delta
      return newQty > 0 ? { ...item, quantity: newQty } : item
    }).filter(item => item.quantity > 0))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSendToTab = () => {
    if (cart.length === 0) return

    cart.forEach(item => {
      addToTab(tab.id, { id: item.id, name: item.name, price: item.price } as any, item.quantity)
    })

    toast.success('Items added to tab!')
    setCart([])
  }

  const handleCloseTab = () => {
    demoCloseTab(tab.id)
    toast.success('Tab closed!')
    router.push(`/${slug}/seller/tables`)
  }

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
            onClick={() => router.push(`/${slug}/seller/tables/${tableId}`)}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Table {table?.number}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {restaurant.name}
            </p>
          </div>
          <Button
            variant="secondary"
            size="default"
            onClick={() => setShowTabView(!showTabView)}
          >
            {showTabView ? 'Add Items' : 'View Tab'}
          </Button>
        </div>

        {/* Tab Summary */}
        <div className="flex items-center justify-between bg-[var(--charcoal-800)] rounded-lg p-3">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Tab Total</p>
            <p className="text-2xl font-bold text-gradient-gold">
              {formatPrice(tab.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--muted-foreground)]">{tab.items.length} items</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {showTabView ? (
        /* View Tab Items */
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Card className="card-glass mb-4">
            <div className="p-4 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[var(--gold-400)]" />
                <span className="font-semibold">Tab Items</span>
              </div>
            </div>

            {tab.items.length === 0 ? (
              <div className="p-8 text-center text-[var(--muted-foreground)]">
                No items yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--card-border)]">
                {tab.items.map((item, index) => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gradient-gold">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Button
            onClick={handleCloseTab}
            disabled={tab.items.length === 0}
            className="w-full"
            size="large"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Close Tab
          </Button>
        </div>
      ) : (
        /* Add Items - Menu */
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )}
                  className="w-full flex items-center justify-between p-3 bg-[var(--charcoal-800)] rounded-lg mb-2"
                >
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {category.products.length} items
                  </span>
                </button>

                {expandedCategory === category.id && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {category.products.map((product) => (
                      <motion.button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[var(--charcoal-800)] hover:bg-[var(--charcoal-700)] rounded-xl p-4 text-left transition-colors"
                      >
                        <p className="font-medium text-sm mb-1 line-clamp-2">{product.name}</p>
                        <p className="text-lg font-bold text-gradient-gold">
                          {formatPrice(product.price)}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Bar */}
      {!showTabView && cartCount > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 glass border-t-2 border-[var(--gold-500)] px-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--gold-500)] text-[var(--charcoal-900)] rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {cartCount}
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Cart</p>
                <p className="text-xl font-bold text-gradient-gold">{formatPrice(cartTotal)}</p>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-[var(--charcoal-800)] rounded-lg p-2">
                <span className="text-sm flex-1">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full bg-[var(--charcoal-700)] flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full bg-[var(--charcoal-700)] flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSendToTab} className="w-full" size="large">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Tab
          </Button>
        </motion.div>
      )}
    </div>
  )
}
