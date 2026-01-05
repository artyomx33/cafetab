"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content wrapper */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--card)] rounded-xl shadow-xl p-6",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[var(--muted-foreground)]">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-4 top-4 rounded-lg p-2",
        "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        "transition-colors",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </button>
  );
});
DialogClose.displayName = "DialogClose";

export { Dialog, DialogContent, DialogClose };
