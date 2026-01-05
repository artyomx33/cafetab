# CafeTab Implementation Plan

> **Date:** 2025-01-05
> **Spec:** [2025-01-05-cafetab-spec.md](./2025-01-05-cafetab-spec.md)

---

## Phase 1: Core Café Conversion (Foundation)

**Goal:** Transform GolfTab into CafeTab while maintaining existing functionality.

### 1.1 Branding & Configuration
- [ ] Update `src/config/site.ts` - Change GolfTab → CafeTab
- [ ] Update `package.json` - name, description
- [ ] Update `README.md` - CafeTab documentation
- [ ] Update page titles and meta tags

### 1.2 Database Schema Migration
- [ ] Create new migration file: `20250105000000_cafetab_schema.sql`
- [ ] Rename tables: `golf_*` → `cafe_*`
- [ ] Add `cafe_tables` table
- [ ] Modify `cafe_tabs` - add `table_id`, `type`, `prepaid_amount`, `balance`, `tip`
- [ ] Drop `golf_groups` references
- [ ] Update RLS policies
- [ ] Update triggers for tab totals

### 1.3 Type Definitions
- [ ] Update `src/types/index.ts`:
  - Add `Table` interface
  - Update `Tab` interface (type, prepaid fields)
  - Add `Order`, `OrderItem` interfaces
  - Add `Notification` interface
  - Add `VenueSettings` interface
  - Add `Transaction` interface
- [ ] Remove `Group` types

### 1.4 Supabase Hooks
- [ ] Create `src/lib/supabase/tables.ts` - Table CRUD
- [ ] Update `src/lib/supabase/hooks.ts`:
  - Replace `useGroups` → `useTables`
  - Add `useTableByQR`
  - Update tab hooks for new schema

### 1.5 Store Updates
- [ ] Rename `seller-store.ts` concepts (groups → tables)
- [ ] Add table-related state
- [ ] Add current tab type tracking

### 1.6 UI Route Conversion
- [ ] Rename `/seller/groups` → `/seller/tables`
- [ ] Rename `/seller/groups/[groupId]` → `/seller/tables/[tableId]`
- [ ] Create `/table/[qr]` for client access
- [ ] Update navigation and links

### 1.7 Component Updates
- [ ] Update `GroupCard` → `TableCard`
- [ ] Update seller pages to use tables
- [ ] Update admin pages to manage tables

### 1.8 Seed Data
- [ ] Update `supabase/seed.sql` with café data:
  - Sample tables (Table 1-10, Bar 1-3, Patio 1-5)
  - Café categories (Drinks, Coffee, Food, Snacks)
  - Café products (espresso, latte, croissant, etc.)

---

## Phase 2: Client Ordering System

**Goal:** Enable clients to scan QR, view menu, and place orders.

### 2.1 Database Additions
- [ ] Create migration: `20250106000000_orders_schema.sql`
- [ ] Add `cafe_orders` table
- [ ] Add `cafe_order_items` table
- [ ] Add `order_id` column to `cafe_tab_items`

### 2.2 Client Hub Page
- [ ] Create `/table/[qr]/page.tsx` - Main client hub
- [ ] Components:
  - `ClientWelcome` - Venue branding + table info
  - `ActionGrid` - Menu, Tab, Pay, Request buttons
  - `BalanceCard` - (for prepaid) show balance

### 2.3 Menu Browser
- [ ] Create `/table/[qr]/menu/page.tsx`
- [ ] Components:
  - `CategoryTabs` - Category navigation
  - `ProductGrid` - Product cards
  - `ProductDetail` - Item modal with notes
  - `CartDrawer` - Current order summary
  - `OrderButton` - Submit order

### 2.4 Order Submission
- [ ] Create `src/lib/supabase/orders.ts`:
  - `createOrder(tabId, items, notes)`
  - `getOrdersByTab(tabId)`
- [ ] Order creates tab_items + links to order record
- [ ] For prepaid: validate balance before allowing

### 2.5 Kitchen Display
- [ ] Create `/seller/orders/page.tsx`
- [ ] Components:
  - `OrderTicket` - Single order card
  - `OrderGrid` - All pending orders
  - `StationFilter` - Bar/Kitchen toggle
- [ ] Hooks:
  - `useOrders(status)` - Fetch orders by status
  - `useMarkOrderReady(orderId)` - Update status

### 2.6 Order Status Flow
- [ ] Order status machine: pending → preparing → ready → served
- [ ] UI for staff to advance status
- [ ] Optional: sound alert on new order

---

## Phase 3: Prepaid Tab System

**Goal:** Enable prepaid tabs with balance tracking and refunds.

### 3.1 Tab Type Selection
- [ ] Update tab creation flow:
  - "Open Regular Tab" vs "Open Prepaid Tab"
  - For prepaid: enter amount loaded
- [ ] Store `type`, `prepaid_amount`, `balance`

### 3.2 Balance Display (Client)
- [ ] Create `BalanceDisplay` component:
  - Large balance number
  - Progress bar (% remaining)
  - "Loaded €X" / "Spent €Y" breakdown
  - Top-up button

### 3.3 Balance Display (Seller)
- [ ] Update `TabCard` with prepaid indicator
- [ ] Show balance, loaded, spent
- [ ] Top-up and refund buttons

### 3.4 Balance Validation
- [ ] Before order submission (prepaid):
  - Calculate order total
  - Check against balance
  - Block if insufficient
  - Show "Top Up" prompt

### 3.5 Top-Up Flow
- [ ] Client: Request top-up → notification to server
- [ ] Seller: Add amount → update balance
- [ ] Create transaction record (type: 'load')

### 3.6 Refund Flow
- [ ] Client: Close tab with balance → choose refund
- [ ] Notification to server
- [ ] Server processes refund on terminal
- [ ] Server confirms in app
- [ ] Tab closed, transaction recorded (type: 'refund')

### 3.7 Transaction Ledger
- [ ] Create `cafe_transactions` table
- [ ] Record all loads, spends, refunds, tips
- [ ] Add to admin reports (future)

---

## Phase 4: Self-Checkout & Service Requests

**Goal:** Enable clients to pay and request assistance.

### 4.1 Notification System
- [ ] Create `cafe_notifications` table
- [ ] Create `src/lib/supabase/notifications.ts`:
  - `createNotification(type, tableId, message)`
  - `getUnreadNotifications(sellerId)`
  - `markAsRead(notificationId)`
- [ ] Polling hook: `useNotifications(interval)`

### 4.2 Notification Bell (Seller UI)
- [ ] Create `NotificationBell` component
- [ ] Badge with unread count
- [ ] Dropdown with recent notifications
- [ ] Click to navigate/dismiss

### 4.3 Request Bill Button
- [ ] Client: Tap "Request Bill"
- [ ] Create notification (type: 'bill_request')
- [ ] Show confirmation: "Server notified"
- [ ] Seller sees notification

### 4.4 Call Server Button
- [ ] Client: Tap "Call Server"
- [ ] Create notification (type: 'server_call')
- [ ] Show confirmation: "Help is on the way"
- [ ] Seller sees notification

### 4.5 Client Payment Flow (Regular Tab)
- [ ] Create `/table/[qr]/pay/page.tsx`
- [ ] Components:
  - `TabSummary` - All items + total
  - `TipSelector` - Tip amount/percentage
  - `PaymentForm` - Stripe Elements
- [ ] On success:
  - Create transaction (type: 'payment')
  - Update tab status to 'paid'
  - Notify server
  - Show receipt

### 4.6 Stripe Integration
- [ ] Set up Stripe account
- [ ] Create Edge Function: `/api/create-payment-intent`
- [ ] Integrate Stripe Elements in checkout
- [ ] Handle success/failure webhooks

---

## Phase 5: Polish & Configuration

**Goal:** Add venue settings, reporting, and quality-of-life features.

### 5.1 Venue Settings
- [ ] Create `cafe_venue_settings` table (single row per venue)
- [ ] Admin page: `/admin/settings`
- [ ] Toggle: client_can_order
- [ ] Toggle: client_can_pay
- [ ] Toggle: require_prepay
- [ ] Toggle: notify_on_every_order

### 5.2 Apply Settings
- [ ] Client pages: Check settings before showing features
- [ ] Hide order button if `client_can_order = false`
- [ ] Hide pay button if `client_can_pay = false`
- [ ] Force prepaid if `require_prepay = true`

### 5.3 Split Bill (Nice-to-Have)
- [ ] Client: "Pay My Share" button
- [ ] Select items belonging to me
- [ ] Pay only selected items
- [ ] Mark paid items on tab

### 5.4 Reorder Button (Nice-to-Have)
- [ ] Show "Order Again" on tab view
- [ ] Copies all current items to new order
- [ ] Great for "same again" scenarios

### 5.5 Admin Reports
- [ ] Sales by day/week/month
- [ ] Top products
- [ ] Average tab value
- [ ] Tips collected
- [ ] Self-order vs server-order ratio

### 5.6 Theme Updates
- [ ] Update `src/config/theme.ts` with café palette
- [ ] Option 1 (Warm): Espresso brown, cream, terracotta
- [ ] Option 2 (Modern): Slate, mint, coral
- [ ] Consider: per-venue theming (future)

---

## Testing Checklist

### Phase 1
- [ ] All golf_ tables renamed to cafe_
- [ ] Tables CRUD works
- [ ] Seller can create table
- [ ] Seller can open tab on table
- [ ] Client can scan QR and see tab
- [ ] Build passes, no TS errors

### Phase 2
- [ ] Client sees menu
- [ ] Client can add items to cart
- [ ] Client can submit order
- [ ] Order appears on kitchen display
- [ ] Staff can mark order done
- [ ] Tab items updated correctly

### Phase 3
- [ ] Seller can create prepaid tab
- [ ] Client sees balance
- [ ] Orders deduct from balance
- [ ] Low balance shows warning
- [ ] Top-up works
- [ ] Refund flow works

### Phase 4
- [ ] Request bill sends notification
- [ ] Call server sends notification
- [ ] Seller sees notifications
- [ ] Client can pay via Stripe
- [ ] Tab marked paid on success
- [ ] Server notified of payment

### Phase 5
- [ ] Settings page works
- [ ] Settings affect client features
- [ ] Reports show data
- [ ] Theme looks good

---

## File Structure (Target)

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── layout.tsx
│   ├── seller/
│   │   ├── page.tsx                # Login
│   │   ├── layout.tsx
│   │   ├── tables/
│   │   │   ├── page.tsx            # Table grid
│   │   │   └── [tableId]/
│   │   │       ├── page.tsx        # Table detail
│   │   │       └── tab/
│   │   │           └── page.tsx    # Tab management
│   │   └── orders/
│   │       └── page.tsx            # Kitchen display
│   ├── table/                      # CLIENT ROUTES (NEW)
│   │   └── [qr]/
│   │       ├── page.tsx            # Client hub
│   │       ├── menu/
│   │       │   └── page.tsx        # Menu browser
│   │       ├── tab/
│   │       │   └── page.tsx        # View tab
│   │       └── pay/
│   │           └── page.tsx        # Checkout
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── tables/
│   │   │   └── page.tsx            # Manage tables
│   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── sellers/
│   │   │   └── page.tsx
│   │   └── settings/               # NEW
│   │       └── page.tsx            # Venue settings
│   └── demo/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   ├── table-card.tsx          # Replaces group-card
│   │   ├── order-ticket.tsx        # NEW
│   │   ├── balance-display.tsx     # NEW
│   │   ├── notification-bell.tsx   # NEW
│   │   ├── tip-selector.tsx        # NEW
│   │   └── ...existing
│   └── theme-provider.tsx
├── config/
│   ├── site.ts
│   └── theme.ts
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── hooks.ts
│       ├── tables.ts               # NEW
│       ├── orders.ts               # NEW
│       └── notifications.ts        # NEW
├── stores/
│   ├── seller-store.ts
│   ├── cart-store.ts
│   ├── ui-store.ts
│   └── theme-store.ts
└── types/
    └── index.ts
```

---

## Dependencies to Add

```bash
# Payments
npm install @stripe/stripe-js @stripe/react-stripe-js

# QR Code generation
npm install qrcode.react

# Sound alerts (optional)
npm install use-sound
```

---

## Environment Variables

```bash
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# New for Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## MCP Requirements

- **serena** - For large refactors (Phase 1, 2)
- **playwright** - For E2E tests (Phase 4, 5)

---

## Notes

- Keep migrations additive where possible
- Test each phase before moving on
- Commit after each sub-task
- Update this plan with `[x]` as tasks complete
