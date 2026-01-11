'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card } from '@/components/ui'
import { Search, Package } from 'lucide-react'

export default function AdminProductsPage() {
  const { restaurant, formatPrice, getCategories, usesDatabase } = useRestaurant()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = getCategories()

  // Filter products
  const filteredCategories = categories.map(cat => ({
    ...cat,
    products: cat.products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(cat =>
    (!selectedCategory || cat.id === selectedCategory) &&
    cat.products.length > 0
  )

  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-[var(--muted-foreground)]">
              {totalProducts} products in {categories.length} categories
            </p>
          </div>
          {!usesDatabase && (
            <span className="px-3 py-1 text-sm bg-[var(--teal-500)]/20 text-[var(--teal-400)] rounded-full">
              Read-only in demo mode
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--charcoal-800)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            !selectedCategory
              ? 'bg-[var(--gold-500)] text-[var(--charcoal-900)]'
              : 'bg-[var(--charcoal-800)] text-[var(--muted-foreground)] hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[var(--gold-500)] text-[var(--charcoal-900)]'
                : 'bg-[var(--charcoal-800)] text-[var(--muted-foreground)] hover:text-white'
            }`}
          >
            {cat.name} ({cat.products.length})
          </button>
        ))}
      </div>

      {/* Products by Category */}
      <div className="space-y-8">
        {filteredCategories.map((category, catIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--gold-400)]" />
              {category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.products.map((product, prodIndex) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: catIndex * 0.1 + prodIndex * 0.03 }}
                >
                  <Card className="card-glass p-4 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold flex-1">{product.name}</h3>
                      <span className="text-lg font-bold text-gradient-gold ml-2">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {product.description}
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">No products found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
