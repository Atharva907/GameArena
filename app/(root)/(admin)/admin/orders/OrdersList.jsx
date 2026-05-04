"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Clock3,
  Eye,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminEmptyState,
  AdminMetric,
  AdminPanel,
  AdminStatusBadge,
  adminGhostButtonClass,
  adminSelectClass,
  adminTableWrapClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getCustomerName = (player) =>
  player?.fullName || player?.name || player?.email || "Guest";

const getCustomerEmail = (player) => player?.email || "No email available";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await apiFetch("/admin/orders");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOrderStatus(id, status) {
    try {
      const response = await apiFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      showToast("success", "Order status updated");
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === id ? { ...order, ...(data.order || data), status } : order,
        ),
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("error", err.message || "Failed to update order status");
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await apiFetch(`/admin/orders/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      showToast("success", data.message || "Order deleted successfully");
      setOrders((currentOrders) => currentOrders.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Error deleting order:", err);
      showToast("error", err.message || "Failed to delete order");
    }
  }

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing", "shipped"].includes(order.status || "pending"),
    ).length;
    const deliveredOrders = orders.filter(
      (order) => (order.status || "pending") === "delivered",
    ).length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    return {
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      totalRevenue,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Orders"
          value={metrics.totalOrders}
          detail="Wallet-store purchases in the current feed"
          icon={ShoppingBag}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="In progress"
          value={metrics.activeOrders}
          detail="Pending, processing, and shipped orders"
          icon={Clock3}
          accent="from-amber-500/20 via-amber-500/5 to-transparent"
        />
        <AdminMetric
          label="Delivered"
          value={metrics.deliveredOrders}
          detail="Completed orders with final fulfillment"
          icon={PackageCheck}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
        <AdminMetric
          label="Revenue"
          value={currencyFormatter.format(metrics.totalRevenue)}
          detail="Gross revenue represented in this order feed"
          icon={CircleDollarSign}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Order feed"
        description="Status changes, customer details, and quick actions stay together so the workflow remains readable across phones, tablets, and desktop."
        action={
          <Button
            type="button"
            variant="outline"
            className={adminGhostButtonClass}
            onClick={fetchOrders}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">Loading orders...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            Error: {error}
          </div>
        ) : orders.length === 0 ? (
          <AdminEmptyState
            title="No orders found"
            description="Orders will appear here once players complete purchases through the storefront."
          />
        ) : (
          <>
            <div className={`hidden lg:block ${adminTableWrapClass}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.items?.length || 0} item(s)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getCustomerName(order.player)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getCustomerEmail(order.player)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{dateFormatter.format(new Date(order.createdAt))}</TableCell>
                      <TableCell>{currencyFormatter.format(order.totalAmount || 0)}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={order.status || "pending"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className={adminGhostButtonClass}>
                            <Link href={`/admin/orders/${order._id}`}>
                              <Eye className="size-4" />
                              <span className="hidden xl:inline">View</span>
                            </Link>
                          </Button>
                          <select
                            value={order.status || "pending"}
                            onChange={(event) =>
                              handleUpdateOrderStatus(order._id, event.target.value)
                            }
                            className={`min-w-[8rem] ${adminSelectClass}`}
                            aria-label={`Update status for order ${order._id}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {orders.map((order) => (
                <div
                  key={`${order._id}-mobile`}
                  className="rounded-[24px] border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        Order #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <AdminStatusBadge status={order.status || "pending"} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{getCustomerName(order.player)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getCustomerEmail(order.player)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">
                        {currencyFormatter.format(order.totalAmount || 0)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <select
                      value={order.status || "pending"}
                      onChange={(event) =>
                        handleUpdateOrderStatus(order._id, event.target.value)
                      }
                      className={`w-full ${adminSelectClass}`}
                      aria-label={`Update status for order ${order._id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/admin/orders/${order._id}`}>
                        <Truck className="size-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
