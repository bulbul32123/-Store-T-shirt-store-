"use client";

import { ordersApi } from "@/lib/ordersApi";
import {
  CheckCircle2,
  Copy,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";

const STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    desc: "We've received your order",
    icon: Package,
  },
  {
    key: "processing",
    label: "Processing",
    desc: "We're getting your items ready",
    icon: Package,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    desc: "Your order is confirmed and packed",
    icon: CheckCircle2,
  },
  {
    key: "shipped",
    label: "Shipped",
    desc: "Your order is on the way!",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Your order has been delivered",
    icon: CheckCircle2,
  },
];

const STEP_DATE_FIELD = {
  pending: "createdAt",
  confirmed: "paidAt",
  shipped: null,
  delivered: "deliveredAt",
};

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    ordersApi
      .getById(id)
      .then(setOrder)
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      toast.success("Order cancelled successfully");
      setIsCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    toast.success("Tracking number copied");
  };

  if (loading) return <OrderSkeleton />;
  if (!order)
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Order not found.
      </div>
    );

  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const canCancel =
    !isCancelled && !["shipped", "delivered"].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => router.push("/orders")}
        className="text-sm text-gray-500 mb-6 hover:text-black transition-colors"
      >
        ← Back to Orders
      </button>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {!isCancelled ? (
        <div className="border rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between relative">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              const Icon = step.icon;
              const dateField = STEP_DATE_FIELD[step.key];
              const dateVal = dateField
                ? order[dateField]
                : step.key === "shipped" && order.trackingNumber
                  ? order.updatedAt
                  : null;

              return (
                <div
                  key={step.key}
                  className="flex-1 flex flex-col items-center relative group cursor-default"
                >
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out bg-gray-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {step.desc}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900"></div>
                  </div>
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStepIndex ? "bg-black" : "bg-gray-200"}`}
                    />
                  )}
                  <div
                    className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center ${done ? "bg-black text-white" : "bg-white border-2 border-gray-200 text-gray-300"} ${active ? "ring-4 ring-gray-100" : ""}`}
                  >
                    <Icon size={15} />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center ${done ? "text-black" : "text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                  {done && dateVal && (
                    <span className="text-[10px] text-gray-400 mt-0.5 text-center">
                      {formatDate(dateVal)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 flex items-center gap-3">
          <XCircle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              This order was cancelled
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Items were restocked and no charge will apply.
            </p>
          </div>
        </div>
      )}

      {order.trackingNumber && (
        <div className="border rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tracking Number</p>
            <p className="font-mono font-medium text-sm">
              {order.trackingNumber}
            </p>
          </div>
          <button
            onClick={copyTracking}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Copy size={15} className="text-gray-500" />
          </button>
        </div>
      )}

      <div className="border rounded-2xl divide-y mb-8">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  height={100}
                  width={100}
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.size && `Size: ${item.size}`}
                {item.size && item.color && " · "}
                {item.color && `Color: ${item.color}`}
              </p>
              <p className="text-sm text-gray-500 mb-1.5">
                Qty: {item.quantity}
              </p>
              {isDelivered &&
                (item.hasReviewed ? (
                  <span className="inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                    ✓ Reviewed
                  </span>
                ) : (
                  <Link
                    href={`/product/${typeof item.product === "object" ? item.product._id : item.product}`}
                    className="inline-block text-xs font-semibold text-black underline hover:text-gray-600"
                  >
                    Write a review for this product
                  </Link>
                ))}
            </div>
            <span className="font-semibold shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border rounded-2xl p-6 space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${order.taxPrice}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span>${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="border rounded-2xl p-6 flex gap-3">
        <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold mb-1 text-sm">Shipping Address</h3>
          <p className="text-gray-600 text-sm">
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
            {order.shippingAddress.country}
          </p>
          {order.phone && (
            <p className="text-gray-500 text-sm mt-1">{order.phone}</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${order.orderNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        type="danger"
        isLoading={cancelling}
      />
    </div>
  );
}
function OrderSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded-md mb-6"></div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="border border-gray-100 rounded-2xl p-6 mb-8 overflow-hidden relative">
        <div className="absolute top-10 left-0 w-full h-0.5 bg-gray-100 z-0"></div>
        <div className="flex items-start justify-between relative z-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full border-4 border-white mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-gray-100 rounded-2xl divide-y mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className="h-20 w-20 bg-gray-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
