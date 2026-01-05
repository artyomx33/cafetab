import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "large", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - mobile-first with large tap targets
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Size variants
          size === "default" && "min-h-[44px] px-6 py-3 text-base",
          size === "large" && "min-h-[56px] px-8 py-4 text-lg",
          // Color variants
          variant === "primary" &&
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 focus-visible:ring-[var(--primary)] hover-glow",
          variant === "secondary" &&
            "bg-[var(--secondary)] text-[var(--foreground)] hover:opacity-90 focus-visible:ring-[var(--secondary)]",
          variant === "ghost" &&
            "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:ring-[var(--primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
