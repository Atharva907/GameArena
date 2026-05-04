"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, XCircle, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";

const statusMap = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-600" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "bg-blue-600" },
  processing: { label: "Processing", icon: Package, color: "bg-purple-600" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-indigo-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-600" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { auth } = useAuth();
  const orderEmail = auth?.email || sessionUser?.email;

  useEffect(() => {
    let isMounted = true;

    const fetchSessionUser = async () => {
      try {
        const response = await apiFetch("/user/me");
        const data = await response.json().catch(() => ({}));

        if (response.ok && isMounted) {
          setSessionUser(data.data || data);
        }
      } catch (error) {
        console.error("Error checking order session:", error);
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    fetchSessionUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("success");

    if (orderId) {
      setSuccessMessage(`Order #${orderId.substring(0, 8)} placed successfully!`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!checkingSession) {
      fetchOrders();
    }
  }, [orderEmail, checkingSession]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (!orderEmail) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await apiFetch(
        `/orders?playerEmail=${encodeURIComponent(orderEmail)}`,
      );
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          Checking order session...
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          Loading orders...
        </section>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 p-3 md:p-4">
        <section className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-10 w-10 text-slate-500" />
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white">No orders yet</h1>
              <p className="text-sm text-slate-400">
                You have not placed any orders yet.
              </p>
            </div>
          </div>
        </section>

        <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      {successMessage && (
        <section className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-300 hover:text-emerald-200"
          >
            <X className="h-4 w-4" />
          </button>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
            Orders
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
            My orders
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review the status and content of each purchase.
          </p>
        </div>

        <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="divide-y divide-slate-800">
          {orders.map((order) => {
            const StatusIcon = statusMap[order.status]?.icon || Package;
            const statusColor = statusMap[order.status]?.color || "bg-gray-600";
            const statusLabel = statusMap[order.status]?.label || order.status;

            return (
              <article key={order._id} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-white">
                        Order #{order.orderNumber || order._id.substring(0, 8)}
                      </h2>
                      <Badge className={`${statusColor} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-800">
                        <img
                          src={item.product?.image || item.imageSnapshot}
                          alt={item.product?.name || item.nameSnapshot || "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.product?.name || item.nameSnapshot || "Product"}
                        </p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-3 bg-slate-800" />

                {order.shippingAddress && (
                  <div className="text-sm text-slate-400">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Shipping address
                    </p>
                    <p className="mt-1 leading-6">
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
