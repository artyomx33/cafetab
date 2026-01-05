"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Glow } from "./glow";
import type { TableStatus } from "@/types";

export interface TableCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tableNumber: string;
  section?: string;
  status: TableStatus;
  currentTabTotal?: number;
}

const TableCard = React.forwardRef<HTMLButtonElement, TableCardProps>(
  (
    { tableNumber, section, status, currentTabTotal, className, ...props },
    ref
  ) => {
    const badgeVariant =
      status === 'available' ? 'active' :
      status === 'occupied' ? 'paid' :
      'closed';

    return (
      <Glow variant="gold" className="rounded-xl">
        <button
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] p-5",
            "hover:bg-[#222226]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
            "active:scale-[0.99]",
            "transition-all duration-200",
            "text-left",
            className
          )}
          {...props}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                Table {tableNumber}
              </h3>
              {section && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  {section}
                </p>
              )}
            </div>
            <Badge variant={badgeVariant}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {status === 'occupied' && currentTabTotal !== undefined && (
            <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2E]">
              <span className="text-sm text-[var(--muted-foreground)]">
                Current Tab
              </span>
              <span className="text-xl font-bold text-[var(--gold-400)]">
                ${currentTabTotal.toFixed(2)}
              </span>
            </div>
          )}
        </button>
      </Glow>
    );
  }
);
TableCard.displayName = "TableCard";

export { TableCard };
