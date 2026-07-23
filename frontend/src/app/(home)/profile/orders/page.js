"use client";
import { ordersApi } from "@/lib/ordersApi";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ACTIVE_STATUSES = ["pending", "processing", "confirmed", "shipped"];

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("current");

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) =>
    tab === "current"
      ? ACTIVE_STATUSES.includes(o.orderStatus)
      : ["delivered", "cancelled"].includes(o.orderStatus),
  );

  if (loading) {
    return <ProfileOrdersSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 mb-8 border-b">
        {["current", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
              tab === t
                ? "border-black text-black"
                : "border-transparent text-gray-400"
            }`}
          >
            {t === "current" ? "Current Orders" : "Order History"}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="text-center py-24 text-gray-500">
          No {tab === "current" ? "active" : "past"} orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <Link
              key={order._id}
              href={`/profile/orders/${order._id}`}
              className="flex items-center justify-between border rounded-2xl p-5 hover:border-black transition"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {order.orderItems?.[0]?.image && (
                    <Image
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order.orderItems.length} item(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.orderStatus]}`}
                >
                  {order.orderStatus}
                </span>
                <span className="font-bold">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


function ProfileOrdersSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      
      <div className="h-9 w-32 bg-gray-200 rounded-lg mb-6" />

      
      <div className="flex gap-6 mb-8 border-b pb-3">
        <div className="h-5 w-28 bg-gray-200 rounded" />
        <div className="h-5 w-28 bg-gray-200 rounded" />
      </div>

      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border border-gray-100 rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              
              <div className="h-16 w-16 bg-gray-200 rounded-xl shrink-0" />
              <div className="space-y-2">
                
                <div className="h-5 w-36 bg-gray-200 rounded" />
                
                <div className="h-4 w-48 bg-gray-200 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              
              <div className="h-7 w-20 bg-gray-200 rounded-full" />
              
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
