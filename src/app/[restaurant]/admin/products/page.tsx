'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useCategories } from '@/lib/supabase/hooks'
import { ListRow } from '@/components/ui/list-row'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Search, Plus, Package, ChevronDown, ChevronUp, DollarSign, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export default function ProductsPage() {
  const { restaurantId, formatPrice, loading: restaurantLoading } = useRestaurant()
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useCategories(restaurantId || undefined)
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Product dialog state
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productCategoryId, setProductCategoryId] = useState('')
  const [productPrepTime, setProductPrepTime] = useState('10')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Category dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [categoryName, setCategoryName] = useState('')

  // Flatten all products from categories
  const products = categories.flatMap(cat => cat.products.map(p => ({ ...p, category_id: cat.id, category_name: cat.name })))

  const loading = restaurantLoading || categoriesLoading

  const openCreateProductDialog = () => {
    setEditingProduct(null)
    setProductName('')
    setProductPrice('')
    setProductDescription('')
    setProductCategoryId(categories[0]?.id || '')
    setProductPrepTime('10')
    setShowProductDialog(true)
  }

  const openEditProductDialog = (product: Product & { category_id: string }) => {
    setEditingProduct(product)
    setProductName(product.name)
    setProductPrice(product.price.toString())
    setProductDescription(product.description || '')
    setProductCategoryId(product.category_id)
    setProductPrepTime(product.prep_time?.toString() || '10')
    setShowProductDialog(true)
  }

  const handleProductSubmit = async () => {
    if (!productName.trim() || !productPrice || !productCategoryId) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      if (editingProduct) {
        const { error } = await supabase
          .from('cafe_products')
          .update({
            name: productName,
            price: parseFloat(productPrice),
            description: productDescription || null,
            category_id: productCategoryId,
            prep_time: parseInt(productPrepTime) || 10
          })
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Product updated!')
      } else {
        const { error } = await supabase
          .from('cafe_products')
          .insert({
            name: productName,
            price: parseFloat(productPrice),
            description: productDescription || null,
            category_id: productCategoryId,
            prep_time: parseInt(productPrepTime) || 10,
            restaurant_id: restaurantId
          })

        if (error) throw error
        toast.success('Product created!')
      }

      setShowProductDialog(false)
      refreshCategories()
    } catch (err) {
      console.error('Failed to save product:', err)
      toast.error('Failed to save product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_products')
        .update({ is_active: !isActive })
        .eq('id', productId)

      if (error) throw error
      toast.success(isActive ? 'Product deactivated' : 'Product activated')
      refreshCategories()
    } catch (err) {
      console.error('Failed to toggle product:', err)
      toast.error('Failed to update product')
    }
  }

  const handleCategorySubmit = async () => {
    if (!categoryName.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cafe_categories')
        .insert({
          name: categoryName,
          restaurant_id: restaurantId
        })

      if (error) throw error
      toast.success('Category created!')
      setCategoryName('')
      setShowCategoryDialog(false)
      refreshCategories()
    } catch (err) {
      console.error('Failed to create category:', err)
      toast.error('Failed to create category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && product.is_active
    if (filter === 'inactive') return matchesSearch && !product.is_active
    return matchesSearch
  })

  const filterOptions = [
    { id: 'all', label: 'All', count: products.length },
    { id: 'active', label: 'Active', count: products.filter(p => p.is_active).length },
    { id: 'inactive', label: 'Inactive', count: products.filter(p => !p.is_active).length },
  ]

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // Expand all categories by default when loaded
  if (categories.length > 0 && expandedCategories.size === 0) {
    setExpandedCategories(new Set(categories.map(c => c.id)))
  }

  const groupedProducts = categories.map(category => ({
    category,
    products: filteredProducts.filter(p => p.category_id === category.id)
  })).filter(group => group.products.length > 0 || filter === 'all')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--muted-foreground)]">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage products and categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => setShowCategoryDialog(true)}>
            Manage Categories
          </Button>
          <Button className="gap-2" onClick={openCreateProductDialog}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 focus:shadow-[0_0_15px_rgba(201,169,98,0.1)] transition-all"
        />
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={setFilter}
        />
      </motion.div>

      {/* Products by Category */}
      {groupedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">No products found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedProducts.map(({ category, products: categoryProducts }, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + catIndex * 0.05 }}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1E1E22] hover:bg-[#252528] border border-[#2A2A2E] transition-all hover:border-[var(--gold-500)]/20 mb-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white">{category.name}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    category.is_visible
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-[var(--charcoal-700)]/50 text-[var(--muted-foreground)] border-[var(--charcoal-600)]/30'
                  }`}>
                    {category.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {categoryProducts.length} products
                  </span>
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                )}
              </button>

              {/* Category Products */}
              {expandedCategories.has(category.id) && (
                <div className="space-y-2 pl-2">
                  {categoryProducts.map((product, prodIndex) => (
                    <ListRow
                      key={product.id}
                      index={prodIndex}
                      avatar={
                        <div className="w-12 h-12 rounded-xl bg-[var(--charcoal-700)] flex items-center justify-center">
                          <Package className="w-6 h-6 text-[var(--gold-400)]" />
                        </div>
                      }
                      title={product.name}
                      badges={[
                        product.is_active
                          ? { label: 'Active', variant: 'success' as const }
                          : { label: 'Inactive', variant: 'muted' as const },
                      ]}
                      subtitle={`Prep time: ${product.prep_time || 10}m`}
                      stat={{
                        icon: <DollarSign className="w-4 h-4" />,
                        value: formatPrice(product.price),
                        color: 'gold',
                      }}
                      rightContent={
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleActive(product.id, product.is_active)
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-[var(--muted-foreground)] hover:text-white transition-colors"
                          >
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditProductDialog(product as Product & { category_id: string })
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--charcoal-700)] hover:bg-[var(--charcoal-600)] text-[var(--muted-foreground)] hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={() => setShowProductDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Product Name
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Price
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Category
              </label>
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Prep Time (minutes)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={productPrepTime}
                  onChange={(e) => setProductPrepTime(e.target.value)}
                  placeholder="10"
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setProductPrepTime('1')}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      productPrepTime === '1'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-[var(--charcoal-700)] text-[var(--muted-foreground)] hover:bg-[var(--charcoal-600)]'
                    }`}
                  >
                    Quick (1m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductPrepTime('10')}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      productPrepTime === '10'
                        ? 'bg-amber-500 text-white'
                        : 'bg-[var(--charcoal-700)] text-[var(--muted-foreground)] hover:bg-[var(--charcoal-600)]'
                    }`}
                  >
                    Normal (10m)
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Quick items (≤3 min) appear in Quick column on Kitchen Display
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowProductDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleProductSubmit}
              disabled={isSubmitting || !productName.trim() || !productPrice || !productCategoryId}
            >
              {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Add New Category</h2>
            <button
              onClick={() => setShowCategoryDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Category Name
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <div className="pt-2">
              <p className="text-sm text-[var(--muted-foreground)]">
                Existing categories: {categories.map(c => c.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCategorySubmit}
              disabled={isSubmitting || !categoryName.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
