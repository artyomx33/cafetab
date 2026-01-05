# GolfTab UI Components

A set of reusable UI components built with GolfTab's design system.

## Design System

- **Primary Green**: `#1B4332`
- **Secondary Beige**: `#D4A574`
- **Accent Gold**: `#C9A227`
- **Background**: `#FAF9F6`
- **Text**: `#2D3436`

All components are mobile-first with large tap targets (minimum 44px) and high contrast for sunlight readability.

## Components

### Button
Primary, secondary, and ghost variants with large touch targets.

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="large">Add to Tab</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
```

### Card
Container component with subtle shadow and rounded corners.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Input
Text input with large font and clear focus states.

```tsx
import { Input } from "@/components/ui";

<Input
  type="text"
  placeholder="Enter group name"
/>
```

### Badge
Status badges for active, closed, and paid states.

```tsx
import { Badge } from "@/components/ui";

<Badge variant="active">Active</Badge>
<Badge variant="closed">Closed</Badge>
<Badge variant="paid">Paid</Badge>
```

### PinInput
4-digit PIN input for seller login with auto-focus.

```tsx
import { PinInput } from "@/components/ui";

<PinInput
  value={pin}
  onChange={setPin}
  onComplete={(pin) => console.log("PIN entered:", pin)}
  length={4}
/>
```

### ProductTile
Large tappable product card for category grid.

```tsx
import { ProductTile } from "@/components/ui";

<ProductTile
  name="Hot Dog"
  price={4.50}
  imageUrl="/images/hotdog.jpg"
  onClick={() => selectProduct(product)}
/>
```

### GroupCard
Card showing group information, status, and total.

```tsx
import { GroupCard } from "@/components/ui";

<GroupCard
  groupName="Hole 7 Crew"
  groupCode="H7C"
  status="active"
  itemCount={5}
  total={23.50}
  onClick={() => viewGroup(group)}
/>
```

### QuantitySelector
Large +/- buttons for selecting quantity.

```tsx
import { QuantitySelector } from "@/components/ui";

<QuantitySelector
  value={quantity}
  onChange={setQuantity}
  min={0}
  max={99}
/>
```

### CategoryToggle
Toggle button to show/hide a category.

```tsx
import { CategoryToggle } from "@/components/ui";

<CategoryToggle
  categoryName="Food"
  isExpanded={isExpanded}
  itemCount={12}
  onClick={() => toggleCategory()}
/>
```

### LoadingSpinner
Simple spinner for loading states.

```tsx
import { LoadingSpinner } from "@/components/ui";

<LoadingSpinner size="medium" />
```

## Accessibility

All components include:
- Proper focus states with visible rings
- ARIA labels where appropriate
- Keyboard navigation support
- Minimum 44px touch targets
- High contrast colors for sunlight readability
