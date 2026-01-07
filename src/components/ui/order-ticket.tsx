"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types";
import { Clock, CheckCircle, ChevronLeft } from "lucide-react";

export interface OrderTicketProps {
  orderId: string;
  tableNumber: string;
  status: OrderStatus;
  createdAt: string;
  notes?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    notes?: string | null;
    modifiers?: Array<{
      name: string;
      priceAdjustment: number;
      quantity: number;
    }>;
  }>;
  onStart?: () => void;
  onDone?: () => void;
  onServe?: () => void;
}

const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  ({ orderId, tableNumber, status, createdAt, notes, items, onStart, onDone, onServe }, ref) => {
    const [timeAgo, setTimeAgo] = React.useState<string>("");
    const [isExiting, setIsExiting] = React.useState(false);

    // Swipe gesture state for ready orders
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-150, 0], [0, 1]);
    const swipeIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

    // Handle swipe complete
    const handleDragEnd = (_: any, info: PanInfo) => {
      if (status === 'ready' && onServe && info.offset.x < -100) {
        setIsExiting(true);
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        setTimeout(() => {
          onServe();
        }, 200);
      }
    };

    // Calculate time since order was placed
    React.useEffect(() => {
      const updateTimeAgo = () => {
        const now = new Date();
        const orderTime = new Date(createdAt);
        const diffMs = now.getTime() - orderTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) {
          setTimeAgo("Just now");
        } else if (diffMins === 1) {
          setTimeAgo("1 min ago");
        } else if (diffMins < 60) {
          setTimeAgo(`${diffMins} mins ago`);
        } else {
          const diffHours = Math.floor(diffMins / 60);
          setTimeAgo(`${diffHours}h ${diffMins % 60}m ago`);
        }
      };

      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }, [createdAt]);

    // Status badge variant mapping
    const statusVariant = {
      pending: "warning" as const,
      preparing: "default" as const,
      ready: "success" as const,
      served: "muted" as const,
      cancelled: "error" as const,
    };

    // Status background color
    const statusBg = {
      pending: "bg-yellow-500/10 border-yellow-500/30",
      preparing: "bg-blue-500/10 border-blue-500/30",
      ready: "bg-green-500/10 border-green-500/30",
      served: "bg-gray-500/10 border-gray-500/30",
      cancelled: "bg-red-500/10 border-red-500/30",
    };

    const isReady = status === 'ready' && onServe;

    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Swipe indicator background - visible when swiping */}
        {isReady && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-end pr-6 rounded-xl"
            style={{ opacity: swipeIndicatorOpacity }}
          >
            <div className="flex items-center gap-2 text-white font-bold">
              <ChevronLeft className="w-6 h-6 animate-pulse" />
              <span>Picked Up</span>
              <CheckCircle className="w-6 h-6" />
            </div>
          </motion.div>
        )}

        <motion.div
          ref={ref}
          className={cn(
            "rounded-xl border-2 p-4 space-y-4 min-h-[300px] flex flex-col relative bg-[var(--charcoal-900)]",
            statusBg[status],
            isReady && "cursor-grab active:cursor-grabbing"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.8 : 1, x: isExiting ? -200 : 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -100 }}
          layout
          // Swipe props - only enabled for ready orders
          drag={isReady ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.3, right: 0 }}
          style={isReady ? { x, opacity } : undefined}
          onDragEnd={isReady ? handleDragEnd : undefined}
        >
        {/* Header - Table Number & Time */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-5xl font-bold text-white mb-1">
              {tableNumber}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
          <Badge variant={statusVariant[status]}>
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Order Items */}
        <div className="flex-1 space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-black/20 rounded-lg p-3 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">
                      {item.quantity}x
                    </span>
                    <span className="text-lg text-white font-medium">
                      {item.productName}
                    </span>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="mt-2 ml-8 space-y-1">
                      {item.modifiers.map((modifier, modIndex) => (
                        <div key={modIndex} className="text-sm text-gray-300">
                          {modifier.priceAdjustment > 0 ? '+' : ''}
                          {modifier.quantity > 1 ? `${modifier.quantity}x ` : ''}
                          {modifier.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-1 text-sm text-yellow-300 italic">
                      Note: {item.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {notes && (
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3">
            <div className="text-sm font-semibold text-yellow-200 mb-1">
              Order Notes:
            </div>
            <div className="text-sm text-yellow-100">{notes}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === "pending" && onStart && (
            <Button
              onClick={onStart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="large"
            >
              Start Preparing
            </Button>
          )}
          {status === "preparing" && onDone && (
            <Button
              onClick={onDone}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="large"
            >
              Mark Ready
            </Button>
          )}
          {status === "ready" && onServe && (
            <div className="flex-1 flex flex-col gap-2">
              {/* Swipe hint for touch users */}
              <div className="text-center text-green-400/70 text-sm flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Swipe left to pick up</span>
              </div>
              {/* Button for laptop/desktop users */}
              <Button
                onClick={() => {
                  setIsExiting(true);
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                  setTimeout(() => {
                    onServe();
                  }, 200);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="large"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark Picked Up
              </Button>
            </div>
          )}
          {status === "ready" && !onServe && (
            <div className="flex-1 text-center text-green-400 font-semibold py-3">
              Ready for Pickup
            </div>
          )}
        </div>
        </motion.div>
      </div>
    );
  }
);
OrderTicket.displayName = "OrderTicket";

export { OrderTicket };
