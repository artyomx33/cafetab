// Burro Tulum - "The Best Burrito in this F***ing Town"
import { RestaurantConfig, generateId, generateQRCode } from './types'

const BURRO_SLUG = 'burro'

export const burroConfig: RestaurantConfig = {
  id: generateId(),
  slug: BURRO_SLUG,
  name: 'Burro Tulum',
  tagline: 'The Best Burrito in Town',
  currency: 'MXN',
  currencySymbol: '$',
  locale: 'es-MX',
  theme: {
    primary: '#C45C4A', // Terracotta red from their branding
    primaryForeground: '#FFFFFF',
    gradient: 'bg-gradient-to-r from-[#C45C4A] to-[#D4846C]',
  },
  categories: [
    // ============ FOOD ============
    {
      id: generateId(),
      name: 'Starters',
      products: [
        { id: generateId(), name: 'Elote Tatemado', price: 70, description: 'Charred Mexican street corn' },
        { id: generateId(), name: 'Guacamole', price: 180, description: 'Fresh avocado dip with totopos' },
      ],
    },
    {
      id: generateId(),
      name: 'Specials - Camote Relleno',
      products: [
        { id: generateId(), name: 'Camote Relleno - Veggies', price: 150, description: 'Stuffed sweet potato with veggies' },
        { id: generateId(), name: 'Camote Relleno - Chicken', price: 180, description: 'Stuffed sweet potato with chicken' },
        { id: generateId(), name: 'Camote Relleno - Sirloin', price: 200, description: 'Stuffed sweet potato with sirloin' },
        { id: generateId(), name: 'Camote Relleno - Rib Eye', price: 220, description: 'Stuffed sweet potato with rib eye' },
      ],
    },
    {
      id: generateId(),
      name: 'Tacos (3 pz.)',
      products: [
        { id: generateId(), name: 'Tacos - Vegetarian', price: 130, description: '3 vegetarian tacos' },
        { id: generateId(), name: 'Tacos - Chicken', price: 150, description: '3 chicken tacos' },
        { id: generateId(), name: 'Tacos - Sirloin', price: 170, description: '3 sirloin tacos' },
        { id: generateId(), name: 'Tacos - Rib Eye', price: 190, description: '3 rib eye tacos' },
        { id: generateId(), name: 'Taco Extras', price: 40, description: 'Additional toppings' },
        { id: generateId(), name: 'Avocado/Cheese', price: 40, description: 'Add avocado or cheese' },
      ],
    },
    {
      id: generateId(),
      name: 'Aguachile de Ribeye',
      products: [
        { id: generateId(), name: 'Aguachile - For 2', price: 490, description: 'Ribeye aguachile for 2 people' },
        { id: generateId(), name: 'Aguachile - For 4', price: 980, description: 'Ribeye aguachile for 4 people' },
      ],
    },
    {
      id: generateId(),
      name: 'Patadas (2 pz.)',
      products: [
        { id: generateId(), name: 'Patadas - Vegetarian', price: 130, description: '2 vegetarian patadas' },
        { id: generateId(), name: 'Patadas - Chicken', price: 150, description: '2 chicken patadas' },
        { id: generateId(), name: 'Patadas - Sirloin', price: 170, description: '2 sirloin patadas' },
        { id: generateId(), name: 'Patadas - Rib Eye', price: 190, description: '2 rib eye patadas' },
      ],
    },
    {
      id: generateId(),
      name: 'The Best Burrito',
      products: [
        { id: generateId(), name: 'Burrito - Vegetarian', price: 180, description: 'The best vegetarian burrito' },
        { id: generateId(), name: 'Burrito - Chicken', price: 190, description: 'The best chicken burrito' },
        { id: generateId(), name: 'Burrito - Sirloin', price: 260, description: 'The best sirloin burrito' },
        { id: generateId(), name: 'Burrito - Rib Eye', price: 290, description: 'The best rib eye burrito' },
      ],
    },
    {
      id: generateId(),
      name: "Chef's Dessert",
      products: [
        { id: generateId(), name: 'La Jacinta', price: 120, description: "Chef's special dessert" },
      ],
    },
    // ============ DRINKS ============
    {
      id: generateId(),
      name: 'Classic Cocktails',
      products: [
        { id: generateId(), name: 'Margarita', price: 150 },
        { id: generateId(), name: 'Mezcalita', price: 150 },
        { id: generateId(), name: 'Cuba', price: 160 },
        { id: generateId(), name: 'Gin Tonic', price: 160 },
        { id: generateId(), name: 'Paloma', price: 160 },
        { id: generateId(), name: 'Vodka Soda', price: 160 },
      ],
    },
    {
      id: generateId(),
      name: 'Soft Drinks',
      products: [
        { id: generateId(), name: 'Sodas', price: 50 },
        { id: generateId(), name: 'Lemonade', price: 50 },
        { id: generateId(), name: 'Natural Water', price: 50 },
        { id: generateId(), name: 'Sparkling Water', price: 50 },
        { id: generateId(), name: 'Felix', price: 60 },
        { id: generateId(), name: 'Flavored Water', price: 50 },
      ],
    },
    {
      id: generateId(),
      name: 'Beers',
      products: [
        { id: generateId(), name: 'Beer (Nacional)', price: 50, description: 'Domestic beer' },
        { id: generateId(), name: 'Beer (Artesanal)', price: 130, description: 'Craft beer' },
      ],
    },
    {
      id: generateId(),
      name: 'Mezcal',
      products: [
        { id: generateId(), name: 'House Mezcal', price: 100 },
        { id: generateId(), name: 'Hilo Joven', price: 150 },
        { id: generateId(), name: 'Pies Desc. Esp.', price: 140 },
        { id: generateId(), name: 'Tobala', price: 160 },
      ],
    },
    {
      id: generateId(),
      name: 'Tequila',
      products: [
        { id: generateId(), name: 'House Tequila', price: 100 },
        { id: generateId(), name: '7 Leguas', price: 200 },
        { id: generateId(), name: 'Don Julio Rep.', price: 200 },
        { id: generateId(), name: 'Don Julio 70', price: 220 },
      ],
    },
    {
      id: generateId(),
      name: 'Ron',
      products: [
        { id: generateId(), name: 'Bacardi', price: 110 },
        { id: generateId(), name: 'Matusalem', price: 160 },
      ],
    },
    {
      id: generateId(),
      name: 'Vodka',
      products: [
        { id: generateId(), name: 'Stolichnaya', price: 150 },
        { id: generateId(), name: "Tito's", price: 190 },
      ],
    },
    {
      id: generateId(),
      name: 'Gin',
      products: [
        { id: generateId(), name: 'Diega', price: 190 },
        { id: generateId(), name: 'Tanqueray', price: 220 },
      ],
    },
    {
      id: generateId(),
      name: 'Whisky',
      products: [
        { id: generateId(), name: 'Red Label', price: 190 },
        { id: generateId(), name: 'Jack Daniels', price: 220 },
      ],
    },
  ],
  tables: [
    { id: generateId(), number: '1', qr_code: generateQRCode(BURRO_SLUG, '1'), section: 'Main' },
    { id: generateId(), number: '2', qr_code: generateQRCode(BURRO_SLUG, '2'), section: 'Main' },
    { id: generateId(), number: '3', qr_code: generateQRCode(BURRO_SLUG, '3'), section: 'Main' },
    { id: generateId(), number: '4', qr_code: generateQRCode(BURRO_SLUG, '4'), section: 'Main' },
    { id: generateId(), number: '5', qr_code: generateQRCode(BURRO_SLUG, '5'), section: 'Main' },
    { id: generateId(), number: '6', qr_code: generateQRCode(BURRO_SLUG, '6'), section: 'Main' },
    { id: generateId(), number: '7', qr_code: generateQRCode(BURRO_SLUG, '7'), section: 'Main' },
  ],
  sellers: [
    { id: generateId(), name: 'Admin', pin: '1234' },
    { id: generateId(), name: 'Server 1', pin: '1111' },
    { id: generateId(), name: 'Server 2', pin: '2222' },
  ],
  settings: {
    clientCanOrder: true,
    clientCanPay: true,
    requirePrepay: false,
    defaultTipOptions: [10, 15, 20],
  },
}
