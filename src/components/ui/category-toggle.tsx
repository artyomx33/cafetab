"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface CategoryToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  categoryName: string;
  isExpanded: boolean;
  itemCount?: number;
}

const CategoryToggle = React.forwardRef<HTMLButtonElement, CategoryToggleProps>(
  ({ categoryName, isExpanded, itemCount, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-between w-full",
          "rounded-lg bg-[#D4A574] px-6 py-4",
          "min-h-[60px]",
          "hover:bg-[#C99563]",
          "active:scale-98",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2",
          "transition-all duration-150",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#2D3436]">
            {categoryName}
          </span>
          {itemCount !== undefined && (
            <span className="text-sm text-[#2D3436]/70">
              ({itemCount})
            </span>
          )}
        </div>

        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-[#2D3436]" />
          ) : (
            <ChevronDown className="w-6 h-6 text-[#2D3436]" />
          )}
        </div>
      </button>
    );
  }
);
CategoryToggle.displayName = "CategoryToggle";

export { CategoryToggle };
