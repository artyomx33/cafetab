// Burro Tulum - "The Best Burrito in this F***ing Town"
import { RestaurantConfig } from './types'

const BURRO_SLUG = 'burro'

// Use stable, deterministic IDs (not random)
const id = (suffix: string) => `burro-${suffix}`

export const burroConfig: RestaurantConfig = {
  id: id('restaurant'),
  slug: BURRO_SLUG,
  name: 'Burro Tulum',
  tagline: 'The Best Burrito in Town',
  currency: 'MXN',
  currencySymbol: '$',
  locale: 'es-MX',
  theme: {
    primary: '#C45C4A',
    primaryForeground: '#FFFFFF',
    gradient: 'bg-gradient-to-r from-[#C45C4A] to-[#D4846C]',
  },
  categories: [
    // ============ FOOD ============
    {
      id: id('cat-starters'),
      name: 'Starters',
      products: [
        { id: id('elote'), name: 'Elote Tatemado', price: 70, description: 'Charred Mexican street corn' },
        { id: id('guac'), name: 'Guacamole', price: 180, description: 'Fresh avocado dip with totopos' },
      ],
    },
    {
      id: id('cat-specials'),
      name: 'Specials - Camote Relleno',
      products: [
        { id: id('camote-veg'), name: 'Camote Relleno - Veggies', price: 150, description: 'Stuffed sweet potato with veggies' },
        { id: id('camote-chk'), name: 'Camote Relleno - Chicken', price: 180, description: 'Stuffed sweet potato with chicken' },
        { id: id('camote-sir'), name: 'Camote Relleno - Sirloin', price: 200, description: 'Stuffed sweet potato with sirloin' },
        { id: id('camote-rib'), name: 'Camote Relleno - Rib Eye', price: 220, description: 'Stuffed sweet potato with rib eye' },
      ],
    },
    {
      id: id('cat-tacos'),
      name: 'Tacos (3 pz.)',
      products: [
        { id: id('taco-veg'), name: 'Tacos - Vegetarian', price: 130, description: '3 vegetarian tacos' },
        { id: id('taco-chk'), name: 'Tacos - Chicken', price: 150, description: '3 chicken tacos' },
        { id: id('taco-sir'), name: 'Tacos - Sirloin', price: 170, description: '3 sirloin tacos' },
        { id: id('taco-rib'), name: 'Tacos - Rib Eye', price: 190, description: '3 rib eye tacos' },
        { id: id('taco-extra'), name: 'Taco Extras', price: 40, description: 'Additional toppings' },
        { id: id('taco-avo'), name: 'Avocado/Cheese', price: 40, description: 'Add avocado or cheese' },
      ],
    },
    {
      id: id('cat-aguachile'),
      name: 'Aguachile de Ribeye',
      products: [
        { id: id('agua-2'), name: 'Aguachile - For 2', price: 490, description: 'Ribeye aguachile for 2 people' },
        { id: id('agua-4'), name: 'Aguachile - For 4', price: 980, description: 'Ribeye aguachile for 4 people' },
      ],
    },
    {
      id: id('cat-patadas'),
      name: 'Patadas (2 pz.)',
      products: [
        { id: id('pat-veg'), name: 'Patadas - Vegetarian', price: 130, description: '2 vegetarian patadas' },
        { id: id('pat-chk'), name: 'Patadas - Chicken', price: 150, description: '2 chicken patadas' },
        { id: id('pat-sir'), name: 'Patadas - Sirloin', price: 170, description: '2 sirloin patadas' },
        { id: id('pat-rib'), name: 'Patadas - Rib Eye', price: 190, description: '2 rib eye patadas' },
      ],
    },
    {
      id: id('cat-burrito'),
      name: 'The Best Burrito',
      products: [
        { id: id('burr-veg'), name: 'Burrito - Vegetarian', price: 180, description: 'The best vegetarian burrito' },
        { id: id('burr-chk'), name: 'Burrito - Chicken', price: 190, description: 'The best chicken burrito' },
        { id: id('burr-sir'), name: 'Burrito - Sirloin', price: 260, description: 'The best sirloin burrito' },
        { id: id('burr-rib'), name: 'Burrito - Rib Eye', price: 290, description: 'The best rib eye burrito' },
      ],
    },
    {
      id: id('cat-dessert'),
      name: "Chef's Dessert",
      products: [
        { id: id('jacinta'), name: 'La Jacinta', price: 120, description: "Chef's special dessert" },
      ],
    },
    // ============ DRINKS ============
    {
      id: id('cat-cocktails'),
      name: 'Classic Cocktails',
      products: [
        { id: id('margarita'), name: 'Margarita', price: 150 },
        { id: id('mezcalita'), name: 'Mezcalita', price: 150 },
        { id: id('cuba'), name: 'Cuba', price: 160 },
        { id: id('gintonic'), name: 'Gin Tonic', price: 160 },
        { id: id('paloma'), name: 'Paloma', price: 160 },
        { id: id('vodkasoda'), name: 'Vodka Soda', price: 160 },
      ],
    },
    {
      id: id('cat-soft'),
      name: 'Soft Drinks',
      products: [
        { id: id('sodas'), name: 'Sodas', price: 50 },
        { id: id('lemonade'), name: 'Lemonade', price: 50 },
        { id: id('water'), name: 'Natural Water', price: 50 },
        { id: id('sparkling'), name: 'Sparkling Water', price: 50 },
        { id: id('felix'), name: 'Felix', price: 60 },
        { id: id('flavored'), name: 'Flavored Water', price: 50 },
      ],
    },
    {
      id: id('cat-beer'),
      name: 'Beers',
      products: [
        { id: id('beer-nac'), name: 'Beer (Nacional)', price: 50, description: 'Domestic beer' },
        { id: id('beer-art'), name: 'Beer (Artesanal)', price: 130, description: 'Craft beer' },
      ],
    },
    {
      id: id('cat-mezcal'),
      name: 'Mezcal',
      products: [
        { id: id('mezc-house'), name: 'House Mezcal', price: 100 },
        { id: id('mezc-hilo'), name: 'Hilo Joven', price: 150 },
        { id: id('mezc-pies'), name: 'Pies Desc. Esp.', price: 140 },
        { id: id('mezc-tobala'), name: 'Tobala', price: 160 },
      ],
    },
    {
      id: id('cat-tequila'),
      name: 'Tequila',
      products: [
        { id: id('teq-house'), name: 'House Tequila', price: 100 },
        { id: id('teq-7leg'), name: '7 Leguas', price: 200 },
        { id: id('teq-djrep'), name: 'Don Julio Rep.', price: 200 },
        { id: id('teq-dj70'), name: 'Don Julio 70', price: 220 },
      ],
    },
    {
      id: id('cat-ron'),
      name: 'Ron',
      products: [
        { id: id('bacardi'), name: 'Bacardi', price: 110 },
        { id: id('matusalem'), name: 'Matusalem', price: 160 },
      ],
    },
    {
      id: id('cat-vodka'),
      name: 'Vodka',
      products: [
        { id: id('stoli'), name: 'Stolichnaya', price: 150 },
        { id: id('titos'), name: "Tito's", price: 190 },
      ],
    },
    {
      id: id('cat-gin'),
      name: 'Gin',
      products: [
        { id: id('diega'), name: 'Diega', price: 190 },
        { id: id('tanqueray'), name: 'Tanqueray', price: 220 },
      ],
    },
    {
      id: id('cat-whisky'),
      name: 'Whisky',
      products: [
        { id: id('redlabel'), name: 'Red Label', price: 190 },
        { id: id('jackd'), name: 'Jack Daniels', price: 220 },
      ],
    },
  ],
  tables: [
    { id: id('table-1'), number: '1', qr_code: 'BURRO-01', section: 'Main' },
    { id: id('table-2'), number: '2', qr_code: 'BURRO-02', section: 'Main' },
    { id: id('table-3'), number: '3', qr_code: 'BURRO-03', section: 'Main' },
    { id: id('table-4'), number: '4', qr_code: 'BURRO-04', section: 'Main' },
    { id: id('table-5'), number: '5', qr_code: 'BURRO-05', section: 'Main' },
    { id: id('table-6'), number: '6', qr_code: 'BURRO-06', section: 'Main' },
    { id: id('table-7'), number: '7', qr_code: 'BURRO-07', section: 'Main' },
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
