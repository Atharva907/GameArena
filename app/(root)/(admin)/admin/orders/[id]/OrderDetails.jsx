"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  CreditCard,
  Package,
  ShoppingBag,
} from "lucide-react";
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

const formatAddress = (shippingAddress) => {
  if (!shippingAddress) {
    return "No shipping address provided";
  }

  return [
    shippingAddress.street || shippingAddress.address,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zipCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");
};

export default function OrderDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const response = await apiFetch(`/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrder(data.order || data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(status) {
    try {
      setIsUpdating(true);
      const response = await apiFetch(`/admin/orders/${orderId}`, {
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

      setOrder(data.order || data);
      showToast("success", "Order status updated");
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("error", err.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  }

  const items = order?.items || [];

  const metrics = useMemo(() => {
    if (!order) {
      return {
        totalAmount: 0,
        itemCount: 0,
        paymentStatus: "pending",
        orderStatus: "pending",
      };
    }

    return {
      totalAmount: Number(order.totalAmount || 0),
      itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      paymentStatus: order.paymentStatus || "pending",
      orderStatus: order.status || "pending",
    };
  }, [items, order]);

  if (loading) {
    return <div className="py-12 text-sm text-muted-foreground">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
        Error: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <AdminEmptyState
        title="Order not found"
        description="The requested order could not be loaded from the current admin dataset."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Order total"
          value={currencyFormatter.format(metrics.totalAmount)}
          detail="Final amount billed for this order"
          icon={CircleDollarSign}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
        <AdminMetric
          label="Items"
          value={metrics.itemCount}
          detail="Combined quantity across all line items"
          icon={Package}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Order status"
          value={metrics.orderStatus}
          detail="Current fulfillment state"
          icon={ShoppingBag}
          accent="from-amber-500/20 via-amber-500/5 to-transparent"
        />
        <AdminMetric
          label="Payment"
          value={metrics.paymentStatus}
          detail="Recorded payment status"
          icon={CreditCard}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <AdminPanel
          title="Order information"
          description="Track fulfillment state, timing, and billing context."
          className="xl:col-span-7"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="mt-1 font-medium">{order._id}</p>
              {order.orderNumber && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Order number: {order.orderNumber}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order date</p>
              <p className="mt-1 font-medium">
                {dateFormatter.format(new Date(order.createdAt))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <AdminStatusBadge status={order.status || "pending"} />
                <select
                  value={order.status || "pending"}
                  onChange={(event) => handleUpdateStatus(event.target.value)}
                  disabled={isUpdating}
                  className={`w-full sm:w-auto ${adminSelectClass}`}
                  aria-label="Update order status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment status</p>
              <div className="mt-2">
                <AdminStatusBadge status={order.paymentStatus || "pending"}>
                  {order.paymentStatus || "pending"}
                </AdminStatusBadge>
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Customer information"
          description="Contact data and shipping details tied to the order."
          className="xl:col-span-5"
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="mt-1 font-medium">{getCustomerName(order.player)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{getCustomerEmail(order.player)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipping address</p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {formatAddress(order.shippingAddress)}
              </p>
            </div>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        title="Order items"
        description="Review the products, pricing, and quantity breakdown included in this order."
      >
        {items.length === 0 ? (
          <AdminEmptyState
            title="No order items"
            description="This order does not currently include any recorded line items."
          />
        ) : (
          <>
            <div className={`hidden lg:block ${adminTableWrapClass}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={`${item.product?._id || item.product}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.product?.image || item.imageSnapshot ? (
                            <img
                              className="size-12 rounded-2xl object-cover ring-1 ring-border/60"
                              src={item.product?.image || item.imageSnapshot}
                              alt={item.product?.name || item.nameSnapshot || "Product"}
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-xs text-muted-foreground">
                              N/A
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {item.product?.name || item.nameSnapshot || "Unknown Product"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{currencyFormatter.format(item.price || 0)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {currencyFormatter.format((item.price || 0) * (item.quantity || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {items.map((item, index) => (
                <div
                  key={`${item.product?._id || item.product}-${index}-mobile`}
                  className="rounded-[24px] border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-4">
                    {item.product?.image || item.imageSnapshot ? (
                      <img
                        src={item.product?.image || item.imageSnapshot}
                        alt={item.product?.name || item.nameSnapshot || "Product"}
                        className="size-16 rounded-[20px] object-cover ring-1 ring-border/60"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-[20px] border border-border/60 bg-muted/30 text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {item.product?.name || item.nameSnapshot || "Unknown Product"}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">
                            {currencyFormatter.format(item.price || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Line total</p>
                          <p className="font-medium">
                            {currencyFormatter.format(
                              (item.price || 0) * (item.quantity || 0),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-border/60 pt-6">
              <div className="rounded-[22px] border border-border/60 bg-muted/20 px-5 py-4 text-right">
                <p className="text-sm text-muted-foreground">Order total</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {currencyFormatter.format(order.totalAmount || 0)}
                </p>
              </div>
            </div>
          </>
        )}
      </AdminPanel>

      <AdminPanel
        title="Status history"
        description="Audit trail for fulfillment changes made to this order."
      >
        {order.statusHistory?.length ? (
          <div className="space-y-3">
            {order.statusHistory
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={`${entry.status}-${entry.changedAt}-${index}`}
                  className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <AdminStatusBadge status={entry.status} />
                    <span className="text-xs text-muted-foreground">
                      {entry.changedAt
                        ? dateFormatter.format(new Date(entry.changedAt))
                        : "No timestamp"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Changed by {entry.changedBy || "system"}
                    {entry.note ? `: ${entry.note}` : ""}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No status history"
            description="Future status changes will be recorded here."
          />
        )}
      </AdminPanel>
    </div>
  );
}
