# GolfTab 🏌️

Mobile-first tab management system for golf course beverage carts.

**"Groups, not tables."** - Golf is mobile, so the GROUP is the anchor.

## Features

### Seller Flow (Cart Staff)
- PIN-based login with "stay logged in" option
- View/create golf groups
- Add items to group tabs
- Category toggles to show/hide product types
- Mark tabs as paid

### Client Flow (Golfers)
- Enter 6-digit group code
- View current tab and running total
- No account needed - just the code

### Admin Dashboard
- Manage products and categories
- Manage sellers
- Sales reporting
- Seller leaderboards

## Tech Stack

- **Next.js 15** - React framework
- **Supabase** - PostgreSQL database + Auth
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Course Green | `#1B4332` | Primary buttons, headers |
| Sand Beige | `#D4A574` | Secondary elements |
| Gold | `#C9A227` | Accents, paid status |
| Off-White | `#FAF9F6` | Backgrounds |
| Charcoal | `#2D3436` | Text |

Mobile-first with large tap targets (44px min) and high contrast for sunlight readability.

## Getting Started

### 1. Set up Supabase

Create a new Supabase project and run the migration:

```bash
npx supabase db push
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Client landing - enter group code |
| `/tab/[code]` | View tab by code |
| `/seller` | Seller login |
| `/seller/groups` | Seller groups list |
| `/seller/groups/[id]` | Add items to group |
| `/admin` | Admin dashboard |
| `/admin/groups` | Manage groups |
| `/admin/products` | Manage products |
| `/admin/sellers` | Manage sellers |

## Database Schema

- **sellers** - Staff with PIN login
- **groups** - Golf groups with 6-digit codes
- **categories** - Product categories (Drinks, Food, Other)
- **products** - Menu items with prices
- **tabs** - Open/paid tabs per group
- **tab_items** - Individual items on a tab

## Seed Data

The migration includes sample data:
- 3 categories (Drinks, Food, Other)
- 20 products across categories
- Ready to use immediately

## License

MIT
