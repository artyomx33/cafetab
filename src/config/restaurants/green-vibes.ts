// Green Vibes - Healthy Cafe & Salad Bar
import { RestaurantConfig } from './types'

const GREEN_VIBES_SLUG = 'green-vibes'

// Use stable, deterministic IDs (not random)
const id = (suffix: string) => `gv-${suffix}`

export const greenVibesConfig: RestaurantConfig = {
  id: id('restaurant'),
  slug: GREEN_VIBES_SLUG,
  name: 'Green Vibes',
  tagline: 'Create your own salad and eat healthy!',
  currency: 'MXN',
  currencySymbol: '$',
  locale: 'es-MX',
  theme: {
    primary: '#2F5233',
    primaryForeground: '#FFFFFF',
    gradient: 'bg-gradient-to-r from-[#2F5233] to-[#4A7C59]',
  },
  categories: [
    // ============ SALAD BAR ============
    {
      id: id('cat-salads'),
      name: 'Salad Bar',
      products: [
        {
          id: id('salad-medium'),
          name: 'Medium Salad',
          price: 180,
          description: 'Base + 2 Proteins + 4 Vegetables. Includes dressing, seeds, crunch & seasoning',
        },
        {
          id: id('salad-large'),
          name: 'Large Salad',
          price: 220,
          description: 'Base + 3 Proteins + 6 Vegetables. Includes dressing, seeds, crunch & seasoning',
        },
        {
          id: id('salad-medium-combo'),
          name: 'Medium Salad Combo',
          price: 210,
          description: 'Medium salad + Soft Drink (335ml)',
        },
        {
          id: id('salad-large-combo'),
          name: 'Large Salad Combo',
          price: 250,
          description: 'Large salad + Soft Drink (335ml)',
        },
      ],
    },
    {
      id: id('cat-bases'),
      name: 'Salad Bases',
      products: [
        { id: id('base-lettuce'), name: 'Lettuce', price: 0, description: 'Included with salad' },
        { id: id('base-green-leaves'), name: 'Green Leaves', price: 45, description: 'Premium base upgrade' },
      ],
    },
    {
      id: id('cat-proteins'),
      name: 'Proteins',
      products: [
        { id: id('prot-tofu'), name: 'Tofu', price: 50, description: 'Plant-based protein' },
        { id: id('prot-egg'), name: 'Egg', price: 50 },
        { id: id('prot-chicken'), name: 'Chicken with Herbs', price: 50 },
        { id: id('prot-tuna'), name: 'Tuna', price: 50 },
        { id: id('prot-kanikama'), name: 'Kanikama', price: 50, description: 'Imitation crab' },
        { id: id('prot-quinoa'), name: 'Quinoa', price: 50, description: 'Plant-based protein' },
        { id: id('prot-bacon'), name: 'Bacon', price: 50 },
        { id: id('prot-panela'), name: 'Panela Cheese', price: 50 },
        { id: id('prot-salmon'), name: 'Smoked Salmon', price: 90, description: 'Premium protein (+$40)' },
        { id: id('prot-shrimp'), name: 'Shrimp', price: 90, description: 'Premium protein (+$40)' },
      ],
    },
    {
      id: id('cat-premium-veg'),
      name: 'Premium Vegetables',
      products: [
        { id: id('veg-mango'), name: 'Mango', price: 40 },
        { id: id('veg-avocado'), name: 'Avocado', price: 40 },
      ],
    },
    {
      id: id('cat-garnish'),
      name: 'Garnish',
      products: [
        { id: id('garnish-guac'), name: 'Guacamole', price: 220 },
        { id: id('garnish-hummus'), name: 'Hummus', price: 220 },
      ],
    },
    // ============ JUICES ============
    {
      id: id('cat-juices'),
      name: 'Juices (500ml)',
      products: [
        { id: id('juice-green'), name: 'Green Juice', price: 80, description: 'Fresh green juice' },
        { id: id('juice-orange'), name: 'Orange Juice', price: 70, description: 'Fresh squeezed orange' },
        { id: id('juice-carrot'), name: 'Carrot Juice', price: 80, description: 'Fresh carrot juice' },
        { id: id('juice-coconut'), name: 'Coconut Water', price: 80, description: 'Natural coconut water' },
      ],
    },
    // ============ SMOOTHIES ============
    {
      id: id('cat-smoothies'),
      name: 'Smoothies (500ml)',
      products: [
        {
          id: id('smooth-love'),
          name: 'Love Vibes',
          price: 140,
          description: 'Almond milk, protein (vanilla), strawberries, banana & peanut butter',
        },
        {
          id: id('smooth-mayan'),
          name: 'Mayan Vibes',
          price: 120,
          description: 'Almond milk, banana, strawberries, cocoa, dates, agave honey, cocoa nibs & coconut flakes',
        },
        {
          id: id('smooth-matcha'),
          name: 'Matcha Vibes',
          price: 120,
          description: 'Almond milk, matcha, mango, banana, spinach & agave honey',
        },
        {
          id: id('smooth-berry'),
          name: 'Berry Vibes',
          price: 140,
          description: 'Almond milk, berries, orange, protein (vanilla) & agave honey',
        },
      ],
    },
    // ============ COFFEE SHOP ============
    {
      id: id('cat-coffee'),
      name: 'Coffee Shop (335ml)',
      products: [
        { id: id('coffee-americano'), name: 'Americano / Iced Americano', price: 60 },
        { id: id('coffee-cappuccino'), name: 'Cappuccino', price: 60 },
        { id: id('coffee-latte'), name: 'Latte / Iced Latte', price: 70 },
        { id: id('coffee-golden'), name: 'Golden Milk', price: 100, description: 'Turmeric latte' },
        { id: id('coffee-chai'), name: 'Chai Latte', price: 80 },
      ],
    },
    // ============ BEVERAGES ============
    {
      id: id('cat-beverages'),
      name: 'Beverages',
      products: [
        { id: id('bev-soft'), name: 'Soft Drinks', price: 40 },
        { id: id('bev-mineral'), name: 'Mineral Water', price: 40 },
        { id: id('bev-natural'), name: 'Natural Water', price: 40 },
      ],
    },
  ],
  tables: [
    { id: id('table-1'), number: '1', qr_code: 'GV-01', section: 'Main' },
    { id: id('table-2'), number: '2', qr_code: 'GV-02', section: 'Main' },
    { id: id('table-3'), number: '3', qr_code: 'GV-03', section: 'Main' },
    { id: id('table-4'), number: '4', qr_code: 'GV-04', section: 'Main' },
    { id: id('table-5'), number: '5', qr_code: 'GV-05', section: 'Main' },
    { id: id('table-6'), number: '6', qr_code: 'GV-06', section: 'Patio' },
    { id: id('table-7'), number: '7', qr_code: 'GV-07', section: 'Patio' },
    { id: id('table-8'), number: '8', qr_code: 'GV-08', section: 'Patio' },
  ],
  sellers: [
    { id: id('seller-admin'), name: 'Admin', pin: '1234' },
    { id: id('seller-1'), name: 'Server 1', pin: '1111' },
    { id: id('seller-2'), name: 'Server 2', pin: '2222' },
  ],
  settings: {
    clientCanOrder: true,
    clientCanPay: true,
    requirePrepay: false,
    defaultTipOptions: [10, 15, 20],
  },
}
