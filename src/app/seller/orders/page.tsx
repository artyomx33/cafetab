"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { OrderTicket } from "@/components/ui/order-ticket";
import { Button } from "@/components/ui/button";
import { useSellerStore } from "@/stores/seller-store";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderWithItems, OrderStatus, Product, Category } from "@/types";
import { Filter } from "lucide-react";

interface OrderTicketData {
  orderId: string;
  tableNumber: string;
  status: OrderStatus;
  createdAt: string;
  notes: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    notes: string | null;
    categoryId?: string;
    modifiers?: Array<{
      name: string;
      priceAdjustment: number;
      quantity: number;
    }>;
  }>;
}

type FilterType = "all" | "bar" | "kitchen";

export default function KitchenOrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useSellerStore();
  const [orders, setOrders] = useState<OrderTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [barCategoryId, setBarCategoryId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/seller");
    }
  }, [isLoggedIn, loading, router]);

  // Fetch bar category ID (assuming drinks category is named "Drinks" or "Bar")
  useEffect(() => {
    const fetchBarCategory = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("cafe_categories")
        .select("id")
        .or("name.ilike.%drink%,name.ilike.%bar%,name.ilike.%beverage%")
        .limit(1)
        .single();

      if (data) {
        setBarCategoryId(data.id);
      }
    };

    fetchBarCategory();
  }, []);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: ordersData, error } = await supabase
        .from("cafe_orders")
        .select(
          `
          id,
          tab_id,
          status,
          notes,
          created_at,
          cafe_tabs!inner (
            table_id,
            cafe_tables!inner (
              number
            )
          ),
          cafe_order_items (
            quantity,
            notes,
            cafe_products!inner (
              name,
              category_id
            ),
            cafe_order_item_modifiers (
              quantity,
              price_adjustment,
              cafe_modifiers!inner (
                name
              )
            )
          )
        `
        )
        .in("status", ["pending", "preparing", "ready"])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      if (ordersData) {
        // Transform the data into OrderTicketData format
        const transformedOrders: OrderTicketData[] = ordersData.map((order: any) => ({
          orderId: order.id,
          tableNumber: order.cafe_tabs.cafe_tables.number,
          status: order.status as OrderStatus,
          createdAt: order.created_at,
          notes: order.notes,
          items: order.cafe_order_items.map((item: any) => ({
            productName: item.cafe_products.name,
            quantity: item.quantity,
            notes: item.notes,
            categoryId: item.cafe_products.category_id,
            modifiers: item.cafe_order_item_modifiers?.map((mod: any) => ({
              name: mod.cafe_modifiers.name,
              priceAdjustment: mod.price_adjustment,
              quantity: mod.quantity,
            })) || [],
          })),
        }));

        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Auto-dismiss ready orders after 30 seconds
  useEffect(() => {
    const readyOrders = orders.filter((order) => order.status === "ready");

    readyOrders.forEach((order) => {
      const orderTime = new Date(order.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - orderTime.getTime();
      const diffSeconds = diffMs / 1000;

      // If order has been ready for more than 30 seconds, mark as served
      if (diffSeconds > 30) {
        handleServeOrder(order.orderId);
      }
    });
  }, [orders]);

  // Handle order status updates
  const handleStartOrder = async (orderId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cafe_orders")
        .update({ status: "preparing" })
        .eq("id", orderId);

      if (error) {
        console.error("Error starting order:", error);
        return;
      }

      // Optimistically update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: "preparing" as OrderStatus } : order
        )
      );
    } catch (error) {
      console.error("Error starting order:", error);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cafe_orders")
        .update({
          status: "ready",
          prepared_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error marking order ready:", error);
        return;
      }

      // Optimistically update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: "ready" as OrderStatus } : order
        )
      );

      // Play a notification sound (optional)
      playNotificationSound();
    } catch (error) {
      console.error("Error marking order ready:", error);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cafe_orders")
        .update({
          status: "served",
          served_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error serving order:", error);
        return;
      }

      // Remove from local state
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    } catch (error) {
      console.error("Error serving order:", error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    } catch (error) {
      // Silently fail if audio not available
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;

    if (filter === "bar") {
      // Show only orders with bar/drink items
      return barCategoryId && order.items.some((item) => item.categoryId === barCategoryId);
    }

    if (filter === "kitchen") {
      // Show only orders with non-bar items
      return order.items.some((item) => item.categoryId !== barCategoryId);
    }

    return true;
  });

  // Group orders by status
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const preparingOrders = filteredOrders.filter((o) => o.status === "preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Kitchen Display</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Updates</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "primary" : "ghost"}
            size="default"
            className={filter === "all" ? "" : "bg-white/10 text-white hover:bg-white/20"}
          >
            All Orders ({orders.length})
          </Button>
          <Button
            onClick={() => setFilter("bar")}
            variant={filter === "bar" ? "primary" : "ghost"}
            size="default"
            className={filter === "bar" ? "" : "bg-white/10 text-white hover:bg-white/20"}
          >
            Bar Only
          </Button>
          <Button
            onClick={() => setFilter("kitchen")}
            variant={filter === "kitchen" ? "primary" : "ghost"}
            size="default"
            className={filter === "kitchen" ? "" : "bg-white/10 text-white hover:bg-white/20"}
          >
            Kitchen Only
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading orders...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-gray-400">All caught up!</div>
            <div className="text-gray-500 mt-2">No pending orders</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">
              Pending ({pendingOrders.length})
            </div>
            <AnimatePresence mode="popLayout">
              {pendingOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                  onStart={() => handleStartOrder(order.orderId)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Preparing Column */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Preparing ({preparingOrders.length})
            </div>
            <AnimatePresence mode="popLayout">
              {preparingOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                  onDone={() => handleMarkReady(order.orderId)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Ready Column */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
              Ready ({readyOrders.length})
            </div>
            <AnimatePresence mode="popLayout">
              {readyOrders.map((order) => (
                <OrderTicket
                  key={order.orderId}
                  orderId={order.orderId}
                  tableNumber={order.tableNumber}
                  status={order.status}
                  createdAt={order.createdAt}
                  notes={order.notes}
                  items={order.items}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
