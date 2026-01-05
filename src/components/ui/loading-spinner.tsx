import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = "medium", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]",
            size === "small" && "h-6 w-6 border-2",
            size === "medium" && "h-12 w-12 border-4",
            size === "large" && "h-16 w-16 border-4"
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
