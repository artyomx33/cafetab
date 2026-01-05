# CafeTab Specification

> **Version:** 1.0
> **Date:** 2025-01-05
> **Status:** Draft
> **Base:** Evolved from GolfTab

---

## Executive Summary

CafeTab transforms the GolfTab golf course tab management system into a universal hospitality solution for cafes, restaurants, beach clubs, and bars. The core innovation: **tabs follow tables, orders flow to the bar/kitchen, and clients can self-serve**.

### The Shift in One Line

| GolfTab | CafeTab |
|---------|---------|
| "Tab follows the GROUP across the course" | "Tab follows the TABLE, orders flow to the bar" |

---

## Core Concepts

### What Changes from GolfTab

| GolfTab Concept | CafeTab Concept |
|-----------------|-----------------|
| Groups (mobile) | Tables (fixed) |
| Holes | Table numbers |
| Seller adds items | Seller OR Client adds items |
| Pay at end only | Pay anytime (prepaid or postpaid) |
| One checkout option | Flexible checkout |

### What Stays the Same

- Seller authentication (PIN-based)
- Product/category management
- Tab item tracking
- Real-time totals
- Admin dashboard

---

## Feature Specifications

### 1. Table Management (NEW)

Tables are physical locations in the venue with QR codes.

**Table Entity:**
```typescript
interface Table {
  id: string
  number: string           // Display number (e.g., "7", "A3", "Patio-2")
  qr_code: string          // Unique QR identifier
  status: 'available' | 'occupied' | 'reserved'
  current_tab_id: string | null
  section: string | null   // Optional grouping (Bar, Patio, Inside)
  created_at: string
}
```

**Flows:**
- Admin creates tables with numbers
- System generates unique QR codes
- Tables show status on dashboard
- Closing tab returns table to 'available'

---

### 2. Tab Types (ENHANCED)

Tabs now support two payment models:

**Tab Entity (Updated):**
```typescript
interface Tab {
  id: string
  table_id: string         // Changed from group_id
  type: 'regular' | 'prepaid'
  status: 'open' | 'paid' | 'refund_pending'
  total: number            // Running total spent
  prepaid_amount: number   // For prepaid: total loaded
  balance: number          // For prepaid: remaining balance
  tip: number              // Optional tip amount
  paid_at: string | null
  created_at: string
  created_by: string       // Seller who opened it
}
```

#### Regular Tab Flow (Pay Later)
1. Server opens tab for table
2. Client/Server adds items
3. Items are served
4. Client requests bill OR pays via app
5. Tab closed

#### Prepaid Tab Flow
1. Server opens prepaid tab, takes payment (e.g., €50)
2. Client gets QR code → sees balance
3. Client orders freely (auto-deducts from balance)
4. Balance low → prompt to top up
5. Client closes tab → remaining balance refunded

---

### 3. Client Self-Order (NEW)

Clients can scan QR and order directly.

**Flow:**
```
[Scan Table QR]
    ↓
[Welcome Screen]
    ├── 🍽️ "View Menu & Order"
    ├── 📋 "View My Tab"
    ├── 💳 "Pay & Leave"
    ├── 🔔 "Request Bill"
    └── 🙋 "Call Server"
```

**Order Entity (NEW):**
```typescript
interface Order {
  id: string
  tab_id: string
  items: OrderItem[]       // Product + quantity
  status: 'pending' | 'preparing' | 'ready' | 'served'
  notes: string | null     // Special instructions
  created_at: string
  prepared_at: string | null
  served_at: string | null
}

interface OrderItem {
  product_id: string
  quantity: number
  notes: string | null     // Per-item notes
}
```

**Behavior by Tab Type:**

| Action | Regular Tab | Prepaid Tab |
|--------|-------------|-------------|
| Add to order | Items added to tab | Deduct from balance first |
| Balance too low | N/A | Block order, prompt top-up |
| View tab | Shows running total | Shows balance + spent |

---

### 4. Client Self-Checkout (NEW)

Clients can pay and leave without server interaction.

**Flow (Regular Tab):**
```
[Tap "Pay & Leave"]
    ↓
[Review Tab Total]
    ↓
[Add Tip (optional)]
    ↓
[Pay via Card/Apple Pay/Google Pay]
    ↓
[Receipt sent to email]
    ↓
🔔 NOTIFICATION → Server
   "Table 7 paid €47.50 via app - Tab closed"
```

**Flow (Prepaid Tab):**
```
[Tap "Close Tab"]
    ↓
[See Remaining Balance: €12.50]
    ↓
[Choose:]
    ├── 💰 "Refund to Card"
    ├── ❤️ "Leave as Tip"
    └── 🎁 "Keep as Credit" (future)
    ↓
[If Refund → Server notified to process]
```

---

### 5. Request Actions (NEW)

Simple notification buttons for human service.

**Request Bill:**
- Client taps "Request Bill"
- Server gets push notification
- Client sees "Server is on the way"

**Call Server:**
- Client taps "Call Server"
- Server gets push notification
- Client sees "Server notified ✓"

---

### 6. Kitchen/Bar Display (NEW)

Simple ticket view for staff preparing orders.

**Display:**
```
┌─────────────────────────────┐
│ TABLE 7          12:34 PM  │
│ ─────────────────────────── │
│ 2x Cappuccino               │
│ 1x Avocado Toast            │
│ 1x Fresh OJ                 │
│ ─────────────────────────── │
│ Notes: "Extra hot milk"     │
│                    [DONE ✓] │
└─────────────────────────────┘
```

**Features:**
- Orders appear in real-time
- Staff marks items as done
- Sound alert on new orders
- Filter by station (Kitchen/Bar)

---

### 7. Notification System (NEW)

**Events & Recipients:**

| Event | Who Gets Notified | Method |
|-------|-------------------|--------|
| New client order | Server + Kitchen | Push + Sound |
| Order ready | Assigned server | Push |
| Request bill | Assigned server | Push |
| Call server | Assigned server | Push |
| Tab paid via app | Server + Admin | Push + Dashboard |
| Balance low (prepaid) | Client | In-app |
| Refund requested | Server | Push |

**Implementation (Phase 1):**
- Polling-based (refresh every 5s)
- Browser notifications enabled
- Sound alerts on new items

**Implementation (Phase 2+):**
- WebSocket for real-time
- Push notifications (if native app)

**Notification Entity:**
```typescript
interface Notification {
  id: string
  type: 'order' | 'bill_request' | 'server_call' | 'payment' | 'refund_request'
  table_id: string
  seller_id: string | null  // Assigned server
  message: string
  read: boolean
  created_at: string
}
```

---

### 8. Service Mode Settings (NEW)

Venues can customize client capabilities.

**Venue Settings:**
```typescript
interface VenueSettings {
  id: string
  venue_id: string
  client_can_order: boolean      // Can clients order via app?
  client_can_pay: boolean        // Can clients pay via app?
  require_prepay: boolean        // Force prepaid tabs?
  notify_on_every_order: boolean // Alert server on each order?
  default_tip_options: number[]  // e.g., [15, 18, 20]
}
```

**Presets:**

| Mode | Client Order | Client Pay | Server Notified |
|------|--------------|------------|-----------------|
| Full Self-Service | ✅ | ✅ | Only on checkout |
| Hybrid | ✅ | ✅ | On every order |
| Traditional+ | ❌ | ✅ | Always |
| Classic | ❌ | ❌ | N/A |

---

### 9. Transactions Ledger (NEW)

Track all money movements for accounting.

**Transaction Entity:**
```typescript
interface Transaction {
  id: string
  tab_id: string
  type: 'load' | 'spend' | 'refund' | 'tip' | 'payment'
  amount: number
  payment_method: string | null  // 'card', 'cash', 'apple_pay'
  processed_by: string | null    // Seller ID
  created_at: string
}
```

---

## Data Model Summary

### New Tables

```sql
-- Tables (physical locations)
cafe_tables (
  id, number, qr_code, status, current_tab_id, section, created_at
)

-- Orders (kitchen flow)
cafe_orders (
  id, tab_id, status, notes, created_at, prepared_at, served_at
)

cafe_order_items (
  id, order_id, product_id, quantity, notes, created_at
)

-- Notifications
cafe_notifications (
  id, type, table_id, seller_id, message, read, created_at
)

-- Venue configuration
cafe_venue_settings (
  id, client_can_order, client_can_pay, require_prepay,
  notify_on_every_order, default_tip_options
)

-- Transaction history
cafe_transactions (
  id, tab_id, type, amount, payment_method, processed_by, created_at
)
```

### Modified Tables

```sql
-- Tabs (enhanced)
cafe_tabs (
  id, table_id, type, status, total, prepaid_amount, balance,
  tip, paid_at, created_at, created_by
)

-- Tab items stay similar but reference cafe_tabs
cafe_tab_items (
  id, tab_id, product_id, seller_id, quantity, unit_price,
  order_id, created_at  -- NEW: link to order
)
```

### Renamed Tables (golf_ → cafe_)

- golf_sellers → cafe_sellers
- golf_categories → cafe_categories
- golf_products → cafe_products
- golf_groups → REMOVED (replaced by tables)

---

## UI Components

### Client App (Mobile-First)

**Pages:**
- `/table/[qr]` - Main client hub
- `/table/[qr]/menu` - Browse & order
- `/table/[qr]/tab` - View current tab
- `/table/[qr]/pay` - Checkout flow

**Components:**
- BalanceDisplay - Shows prepaid balance with progress bar
- MenuBrowser - Categories + products
- OrderBuilder - Add items with notes
- TipSelector - Tip amount picker
- ActionButtons - Request bill, call server

### Seller App

**Pages:**
- `/seller` - Login
- `/seller/tables` - Table grid (replaces /seller/groups)
- `/seller/tables/[id]` - Manage specific table/tab
- `/seller/orders` - Kitchen display
- `/seller/notifications` - Alert center

**Components:**
- TableGrid - Visual table layout
- TabCard - Enhanced with type indicator
- OrderTicket - Kitchen display item
- NotificationBell - Badge with count

### Admin Dashboard

**Pages:**
- `/admin/tables` - Manage tables
- `/admin/settings` - Venue settings
- `/admin/reports` - Sales reports

---

## Phase Plan

### Phase 1: Core Café Conversion (MVP)
- [ ] Rename golf_ to cafe_ (DB + code)
- [ ] Add tables entity
- [ ] Convert groups to tables in UI
- [ ] Table QR code generation
- [ ] Client QR scan → view tab

### Phase 2: Client Ordering
- [ ] Client menu view
- [ ] Client can add items to order
- [ ] Orders → Kitchen display
- [ ] Basic notifications (polling)

### Phase 3: Prepaid System
- [ ] Tab types (regular/prepaid)
- [ ] Balance tracking
- [ ] Client balance display
- [ ] Top-up flow
- [ ] Refund request flow

### Phase 4: Self-Checkout
- [ ] Client payment flow (Stripe)
- [ ] Request bill button
- [ ] Call server button
- [ ] Payment notifications

### Phase 5: Polish & Settings
- [ ] Venue settings (service modes)
- [ ] Split bill feature
- [ ] Reorder button
- [ ] Transaction ledger
- [ ] Reports dashboard

---

## Technical Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- Zustand (state)
- Framer Motion (animations)
- TailwindCSS

**Backend:**
- Supabase (Postgres + Auth + Realtime)
- Supabase Edge Functions (for webhooks)

**Payments:**
- Stripe (cards, Apple Pay, Google Pay)
- Stripe Terminal (for in-person refunds)

**Notifications:**
- Phase 1: Polling + Browser Notifications
- Phase 2: Supabase Realtime subscriptions
- Phase 3: Push notifications (if native)

---

## Success Metrics

- **Table turnover time** - Time from open to close
- **Self-order adoption** - % orders via client app
- **Self-checkout adoption** - % payments via client app
- **Average tip %** - Compare app vs traditional
- **Server efficiency** - Tables served per hour

---

## Future Features (Backlog)

- [ ] Multi-language menus
- [ ] Dietary filters (vegan, GF, etc.)
- [ ] Wait time estimates
- [ ] Happy hour auto-pricing
- [ ] Client accounts + persistent credit
- [ ] Loyalty points
- [ ] Table reservations
- [ ] Multi-venue support
- [ ] Native mobile apps
