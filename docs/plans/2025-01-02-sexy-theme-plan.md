# GolfTab Sexy Theme Implementation Plan

**Goal**: Add a toggle between current "Classic" theme and new "Premium Dark" theme inspired by TeddySnaps

## Phase 1: Theme Infrastructure

### 1.1 Create Theme Store
**File**: `src/stores/theme-store.ts`
- Create Zustand store with theme state
- Options: `'classic'` | `'premium'`
- Persist to localStorage
- Export `useTheme()` hook

### 1.2 Update CSS Variables
**File**: `src/app/globals.css`
- Add `.theme-classic` class with current colors
- Add `.theme-premium` class with TeddySnaps-inspired colors:
  - Background: `#0D0D0F` (ultra-dark)
  - Foreground: `#FFFFFF` (white)
  - Primary: `#C9A962` (gold)
  - Secondary: `#4ECDC4` (teal)
  - Card: `rgba(39, 39, 42, 0.5)` (glass)
- Add glass morphism utility class
- Add glow effect utilities
- Add gradient text utility

### 1.3 Add Premium Fonts
**File**: `src/app/layout.tsx`
- Add Playfair Display for premium headings
- Keep Inter for body text

---

## Phase 2: Theme Toggle Component

### 2.1 Create ThemeToggle Component
**File**: `src/components/ui/theme-toggle.tsx`
- Two-button toggle (Classic | Premium)
- Shows current active theme
- Smooth transition animation
- Place in header/nav areas

### 2.2 Apply Theme to Root
**File**: `src/app/layout.tsx`
- Read theme from store
- Apply theme class to `<body>`

---

## Phase 3: Update UI Components for Theme Support

### 3.1 Update Button Component
**File**: `src/components/ui/button.tsx`
- Add theme-aware variants
- Premium: gold primary, glass secondary
- Add hover glow effects for premium

### 3.2 Update Card Component
**File**: `src/components/ui/card.tsx`
- Add `glass` variant for premium theme
- Add `glow` variant for premium theme
- Support backdrop-blur

### 3.3 Update Badge Component
**File**: `src/components/ui/badge.tsx`
- Premium: semi-transparent colored backgrounds
- Add glow borders

### 3.4 Update Input Component
**File**: `src/components/ui/input.tsx`
- Premium: dark background with gold focus ring

### 3.5 Update ProductTile Component
**File**: `src/components/ui/product-tile.tsx`
- Premium: glass effect, hover glow

### 3.6 Update GroupCard Component
**File**: `src/components/ui/group-card.tsx`
- Premium: glass effect, animated entrance

### 3.7 Update PinInput Component
**File**: `src/components/ui/pin-input.tsx`
- Premium: dark boxes with gold focus

---

## Phase 4: Update Page Layouts

### 4.1 Update Root Layout
**File**: `src/app/layout.tsx`
- Theme provider wrapper
- Background gradient for premium theme

### 4.2 Update Client Landing Page
**File**: `src/app/page.tsx`
- Premium: background glow blobs
- Gradient text on heading
- Glass card for code entry

### 4.3 Update Tab View Page
**File**: `src/app/tab/[code]/page.tsx`
- Premium: glass header
- Gradient total display
- Glass item cards

### 4.4 Update Seller Pages
**Files**:
- `src/app/seller/layout.tsx` - Add sidebar style option
- `src/app/seller/page.tsx` - Premium login styling
- `src/app/seller/groups/page.tsx` - Glass cards, animations
- `src/app/seller/groups/[groupId]/page.tsx` - Glass product grid
- `src/app/seller/groups/[groupId]/tab/page.tsx` - Premium receipt view

### 4.5 Update Admin Pages
**Files**:
- `src/app/admin/layout.tsx` - Premium sidebar with glass
- `src/app/admin/page.tsx` - Animated stats, glass cards
- `src/app/admin/groups/page.tsx` - Glass table/cards
- `src/app/admin/products/page.tsx` - Premium product grid
- `src/app/admin/sellers/page.tsx` - Leaderboard with glows

---

## Phase 5: Animations & Polish

### 5.1 Add Framer Motion
**Action**: Already installed, just use it
- Fade-in animations on page load
- Staggered list animations
- Hover scale effects
- Smooth transitions

### 5.2 Add Glow Effects
**File**: `src/components/ui/glow.tsx`
- Dynamic glow component
- Mouse-tracking gradient border
- Multiple color presets (gold, teal)

### 5.3 Add Background Effects
**File**: `src/components/ui/background-glow.tsx`
- Floating glow blobs
- Atmospheric depth for landing pages

---

## Implementation Order

1. **Theme Store** (5 min) - Foundation
2. **CSS Variables** (15 min) - All colors and utilities
3. **Layout + Fonts** (5 min) - Apply theme class
4. **Theme Toggle** (10 min) - User control
5. **Core Components** (30 min) - Button, Card, Badge, Input
6. **Page Components** (20 min) - ProductTile, GroupCard, PinInput
7. **Landing Page** (15 min) - Hero with effects
8. **Seller Pages** (20 min) - All seller flows
9. **Admin Pages** (20 min) - Dashboard and management
10. **Animations** (15 min) - Framer Motion polish
11. **Final Polish** (10 min) - Tweaks and fixes

**Total Estimate**: ~2.5 hours

---

## Color Reference

### Classic Theme (Current)
```css
--primary-green: #1B4332;
--secondary-beige: #D4A574;
--accent-gold: #C9A227;
--background: #FAF9F6;
--foreground: #2D3436;
```

### Premium Theme (TeddySnaps-inspired)
```css
--background: #0D0D0F;
--foreground: #FFFFFF;
--primary-gold: #C9A962;
--secondary-teal: #4ECDC4;
--card: rgba(39, 39, 42, 0.5);
--card-border: rgba(63, 63, 68, 0.5);
--charcoal-900: #18181b;
--charcoal-800: #27272a;
--charcoal-700: #3f3f46;
```

---

## Key Visual Elements

### Glass Morphism
```css
.glass {
  background-color: rgba(39, 39, 42, 0.5);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(63, 63, 68, 0.5);
}
```

### Gold Glow
```css
.glow-gold {
  box-shadow: 0 0 40px rgba(201, 169, 98, 0.15);
}
```

### Gradient Text
```css
.text-gradient-gold {
  background: linear-gradient(to right, #D4A82E, #C9A962);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Success Criteria

- [ ] Theme toggle works instantly (no page reload)
- [ ] Classic theme looks exactly as before
- [ ] Premium theme has TeddySnaps-level polish
- [ ] All pages support both themes
- [ ] Animations are smooth (60fps)
- [ ] Mobile-friendly in both themes
- [ ] LocalStorage persists preference
