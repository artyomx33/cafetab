"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
}

const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  ({ length = 4, value, onChange, onComplete, className }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, digit: string) => {
      // Only allow single digits
      if (digit && !/^\d$/.test(digit)) return;

      const newValue = value.split("");
      newValue[index] = digit;
      const newPin = newValue.join("").slice(0, length);

      onChange(newPin);

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete when all digits are entered
      if (newPin.length === length && onComplete) {
        onComplete(newPin);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain");
      const digits = pastedData.replace(/\D/g, "").slice(0, length);
      onChange(digits);

      if (digits.length === length && onComplete) {
        onComplete(digits);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex gap-3 justify-center", className)}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-16 h-20 text-center text-3xl font-bold rounded-lg",
              "border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]",
              "transition-all duration-200"
            )}
            autoComplete="off"
          />
        ))}
      </div>
    );
  }
);
PinInput.displayName = "PinInput";

export { PinInput };
