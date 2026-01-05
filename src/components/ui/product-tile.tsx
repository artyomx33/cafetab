"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Glow } from "./glow";

export interface ProductTileProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  price: number;
  imageUrl?: string;
}

const ProductTile = React.forwardRef<HTMLButtonElement, ProductTileProps>(
  ({ name, price, imageUrl, className, ...props }, ref) => {
    return (
      <Glow variant="gold" className="rounded-xl" spread={40} blur={4}>
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
      </Glow>
    );
  }
);
ProductTile.displayName = "ProductTile";

export { ProductTile };
