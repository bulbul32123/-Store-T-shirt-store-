"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ordersApi } from "@/lib/ordersApi";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
} from "lucide-react";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = ["pending", "processing", "confirmed", "shipped"];

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-50 text-blue-700 border border-blue-100",
    icon: Package,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    icon: CheckCircle2,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-50 text-purple-700 border border-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-50 text-green-700 border border-green-100",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border border-red-100",
    icon: XCircle,
  },
};

const PROGRESS_STEPS = [
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
];

function MiniProgress({ status }) {
  if (status === "cancelled") return null;
  const idx = PROGRESS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-100">
      {PROGRESS_STEPS.map((step, i) => {
        const isCompleted = i < idx;
        const isActive = i === idx;
        const isFinalStep = step === "delivered";

        return (
          <div key={step} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1 w-full rounded-full transition-all duration-500 ${
                isCompleted || (isActive && isFinalStep)
                  ? "bg-black" // Solid black for finished steps OR if the final step is reached
                  : isActive
                    ? "bg-gradient-to-r from-black to-gray-200 shadow-[0_0_5px_rgba(0,0,0,0.1)]" // Beautiful fading gradient for the current in-progress step
                    : "bg-gray-100" // Light gray for upcoming steps
              }`}
            />
            <span
              className={`text-[9px] tracking-tight capitalize transition-colors duration-300 ${
                isActive
                  ? "text-black font-bold"
                  : isCompleted
                    ? "text-gray-800 font-medium"
                    : "text-gray-400 font-medium"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default function OrdersClientPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "active") return ACTIVE_STATUSES.includes(o.orderStatus);
    return o.orderStatus === tab;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Your Orders</h1>
      <p className="text-gray-500 text-sm mb-6">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>

      <div className="flex gap-2 mb-8 border-b overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all ${
              tab === t.key
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="text-center py-24 border border-dashed rounded-2xl bg-gray-50/50">
          <Package size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            No orders found in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const meta = STATUS_META[order.orderStatus] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="group block border bg-white rounded-2xl p-5 hover:border-black hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      {order.orderItems?.[0]?.image && (
                        <Image
                          src={order.orderItems[0].image}
                          alt={order.orderItems[0].name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {order.orderItems.length > 1 && (
                        <span className="absolute bottom-1 right-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                          +{order.orderItems.length - 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <ArrowRight
                          size={14}
                          className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {order.orderItems[0]?.name}
                        {order.orderItems.length > 1
                          ? ` + ${order.orderItems.length - 1} more`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end justify-between h-16">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.color}`}
                    >
                      <Icon size={12} /> {meta.label}
                    </span>
                    <p className="font-bold text-gray-900 text-lg">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <MiniProgress status={order.orderStatus} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
