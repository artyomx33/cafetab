# GolfTab Design Document

**Created**: 2025-01-02
**Status**: Implemented

## Overview

GolfTab is a mobile-first tab management system for golf course beverage carts, built as a spin-off of TeddySnaps architecture.

**Core Concept**: "Groups, not tables." - Golf is mobile, so the GROUP is the anchor.

## Design Decisions

### User Types & Priority

| Priority | User | Description |
|----------|------|-------------|
| 1 | **Seller** | Cart staff who add items to tabs |
| 2 | **Client** | Golfers who view their tab |
| 3 | **Admin** | Management dashboard |

### Key Design Choices

1. **Group Identification**: Admin or Seller creates group → 6-digit code generated → Golfer uses code to view tab
2. **Item Entry**: Category grid with toggle buttons to show/hide categories
3. **Offline Mode**: None - online required (keep it simple)
4. **Payment**: Seller marks as paid (no payment gateway integration in v1)
5. **Tab Items**: Minimal - product + quantity only (no notes)
6. **Seller Login**: PIN + optional "stay logged in" setting
7. **Admin Features**: Products, sellers, reports, leaderboards (no export, no multi-location, no inventory)
8. **Client Portal**: View only - see tab and total
9. **Tab Closing**: Mark paid → archived (fresh code next time)

## Tech Stack

- **Next.js 15** - Full-stack React framework
- **Supabase** - PostgreSQL + Row Level Security
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

## Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Course Green | `#1B4332` | Primary buttons, headers |
| Sand Beige | `#D4A574` | Secondary elements, category toggles |
| Gold | `#C9A227` | Accents, paid status |
| Off-White | `#FAF9F6` | Backgrounds |
| Charcoal | `#2D3436` | Text |

### UX Requirements
- Sunlight-readable (high contrast)
- Glove-friendly (44px+ tap zones)
- Mobile-first (all flows)
- 3 taps max to add an item

## Database Schema

```
sellers (id, name, pin_hash, avatar_url, is_active)
groups (id, name, client_code, status, created_by)
categories (id, name, sort_order, is_visible)
products (id, category_id, name, price, image_url, is_active, sort_order)
tabs (id, group_id, status, total, paid_at)
tab_items (id, tab_id, product_id, quantity, unit_price, seller_id)
```

## Routes

| Route | User | Description |
|-------|------|-------------|
| `/` | Client | Enter group code |
| `/tab/[code]` | Client | View tab |
| `/seller` | Seller | PIN login |
| `/seller/groups` | Seller | Active groups list |
| `/seller/groups/[id]` | Seller | Add items to group |
| `/seller/groups/[id]/tab` | Seller | View/close tab |
| `/admin` | Admin | Dashboard + stats |
| `/admin/groups` | Admin | Manage groups |
| `/admin/products` | Admin | Manage products |
| `/admin/sellers` | Admin | Manage sellers |

## Entity Mapping from TeddySnaps

| TeddySnaps | → | GolfTab |
|------------|---|---------|
| Families | → | Golf Groups |
| Children | → | Players (optional) |
| Photos | → | Tab Items |
| Albums/Events | → | Rounds/Sessions |
| Parent Login Code | → | Client Login Code |
| Photo Gallery | → | Order History |

## Future Considerations (v2+)

- Stripe payment integration
- Offline queue mode
- Multi-location support
- Export to CSV
- Inventory tracking
- Player-level tracking
