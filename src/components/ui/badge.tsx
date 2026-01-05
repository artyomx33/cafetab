import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "active" | "closed" | "paid" | "default" | "gold" | "teal" | "purple" | "success" | "error" | "warning" | "muted";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
          // Transparent badge styles
          variant === "active" && "badge-success",
          variant === "closed" && "badge-muted",
          variant === "paid" && "badge-teal",
          variant === "default" && "badge-gold",
          variant === "gold" && "badge-gold",
          variant === "teal" && "badge-teal",
          variant === "purple" && "badge-purple",
          variant === "success" && "badge-success",
          variant === "error" && "badge-error",
          variant === "warning" && "badge-warning",
          variant === "muted" && "badge-muted",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
