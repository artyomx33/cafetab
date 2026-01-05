"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              "peer h-6 w-6 shrink-0 rounded border-2 border-gray-300",
              "bg-white cursor-pointer appearance-none",
              "checked:bg-[#1B4332] checked:border-[#1B4332]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors",
              className
            )}
            {...props}
          />
          <Check
            className={cn(
              "pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 text-white",
              "opacity-0 peer-checked:opacity-100",
              "transition-opacity"
            )}
            strokeWidth={3}
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-base text-[#2D3436] cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
