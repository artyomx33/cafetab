"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Glow } from "./glow";

export interface GroupCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  groupName: string;
  groupCode: string;
  status: "active" | "closed" | "paid";
  itemCount: number;
  total: number;
}

const GroupCard = React.forwardRef<HTMLButtonElement, GroupCardProps>(
  (
    { groupName, groupCode, status, itemCount, total, className, ...props },
    ref
  ) => {
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
                {groupName}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">Code: {groupCode}</p>
            </div>
            <Badge variant={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2E]">
            <span className="text-sm text-[var(--muted-foreground)]">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="text-xl font-bold text-[var(--gold-400)]">
              ${total.toFixed(2)}
            </span>
          </div>
        </button>
      </Glow>
    );
  }
);
GroupCard.displayName = "GroupCard";

export { GroupCard };
