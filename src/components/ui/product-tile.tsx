"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Glow } from "./glow";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ProductTileProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  price: number;
  imageUrl?: string;
  hasModifiers?: boolean;
  onQuickAdd?: () => void;
  quickAddCount?: number;
}

const ProductTile = React.forwardRef<HTMLButtonElement, ProductTileProps>(
  ({ name, price, imageUrl, hasModifiers = true, onQuickAdd, quickAddCount = 0, className, ...props }, ref) => {
    const [localCount, setLocalCount] = React.useState(0);
    const [showBadge, setShowBadge] = React.useState(false);
    const lastTapRef = React.useRef<number>(0);
    const fadeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Use external count if provided, otherwise use local
    const displayCount = quickAddCount || localCount;

    // Handle quick add with debounce
    const handleQuickAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const now = Date.now();
      // Debounce: 150ms minimum between taps
      if (now - lastTapRef.current < 150) return;
      lastTapRef.current = now;

      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Update local count for badge display
      setLocalCount(prev => prev + 1);
      setShowBadge(true);

      // Call the callback
      onQuickAdd?.();

      // Clear existing fade timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }

      // Auto-fade badge after 1.5 seconds of inactivity
      fadeTimeoutRef.current = setTimeout(() => {
        setShowBadge(false);
        // Reset local count after fade
        setTimeout(() => setLocalCount(0), 300);
      }, 1500);
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    }, []);

    const showQuickAdd = !hasModifiers && onQuickAdd;

    return (
      <Glow variant="gold" className="rounded-xl" spread={40} blur={4}>
        <div className="relative">
          <button
            ref={ref}
            className={cn(
              // Large tappable card
              "flex flex-col items-center justify-center gap-3 rounded-xl",
              "bg-[#1A1A1E] border-2 border-[#2A2A2E]",
              "min-h-[140px] p-4 w-full",
              // Interactive states
              "hover:bg-[#222226]",
              "active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {imageUrl && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-base font-semibold text-[var(--foreground)] text-center line-clamp-2">
                {name}
              </span>
              <span className="text-lg font-bold text-[var(--gold-400)]">
                ${price.toFixed(2)}
              </span>
            </div>
          </button>

          {/* Quick Add Button - full height strip on right side */}
          {showQuickAdd && (
            <motion.button
              onClick={handleQuickAdd}
              className={cn(
                "absolute top-0 right-0 bottom-0 z-10",
                "w-14 rounded-r-xl",
                "bg-[#3A3A3E] hover:bg-[#4A4A4E] active:bg-[#5A5A5E]",
                "border-l border-[#4A4A4E]",
                "flex items-center justify-center",
                "transition-all duration-150"
              )}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0.9 }}
              whileHover={{ opacity: 1 }}
            >
              <AnimatePresence mode="wait">
                {showBadge && displayCount > 0 ? (
                  <motion.span
                    key="count"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="text-2xl font-bold text-white"
                  >
                    {displayCount}
                  </motion.span>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Plus className="w-7 h-7 text-white/80" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </Glow>
    );
  }
);
ProductTile.displayName = "ProductTile";

export { ProductTile };
