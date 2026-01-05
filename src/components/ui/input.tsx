import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with large font and clear focus
          "flex w-full rounded-lg border px-4 py-3",
          "border-[var(--input-border)] bg-[var(--input-bg)]",
          "text-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
          "min-h-[56px]",
          // Focus states - high contrast for sunlight readability
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
          "focus-visible:border-[var(--primary)]",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]",
          // Mobile-friendly
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
