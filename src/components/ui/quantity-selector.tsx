"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QuantitySelector = React.forwardRef<HTMLDivElement, QuantitySelectorProps>(
  ({ value, onChange, min = 0, max = 99, className }, ref) => {
    const handleDecrement = () => {
      if (value > min) {
        onChange(value - 1);
      }
    };

    const handleIncrement = () => {
      if (value < max) {
        onChange(value + 1);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-4 rounded-lg border-2 border-gray-300 bg-white p-2",
          className
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-lg",
            "bg-[#D4A574] text-[#2D3436] text-2xl font-bold",
            "hover:bg-[#C99563]",
            "active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          )}
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span className="text-3xl font-bold text-[#2D3436] min-w-[3rem] text-center">
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-lg",
            "bg-[#1B4332] text-white text-2xl font-bold",
            "hover:bg-[#143428]",
            "active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          )}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }
);
QuantitySelector.displayName = "QuantitySelector";

export { QuantitySelector };
