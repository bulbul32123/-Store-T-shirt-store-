"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Circle } from "lucide-react";
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";
import { ordersApi } from "@/lib/ordersApi";
import ConfirmModal from "@/components/common/ConfirmModal";

const STEPS = ["pending", "processing", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Order not found.
      </div>
    );
  }

  const isCancelled = order.orderStatus === "cancelled";
  const currentStepIndex = STEPS.indexOf(order.orderStatus);
  const canCancel =
    !isCancelled && !["shipped", "delivered"].includes(order.orderStatus);
  const isDelivered = order.orderStatus === "delivered";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => router.push("/profile/orders")}
        className="text-sm text-gray-500 mb-6 hover:text-black transition-colors"
      >
        ← Back to Orders
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition"
          >
            Cancel Order
          </button>
        )}
      </div>

      {!isCancelled ? (
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >
              {i > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-0.5 ${
                    i <= currentStepIndex ? "bg-black" : "bg-gray-200"
                  }`}
                />
              )}
              {i <= currentStepIndex ? (
                <CheckCircle2
                  size={24}
                  className="text-black relative z-10 bg-white"
                />
              ) : (
                <Circle
                  size={24}
                  className="text-gray-300 relative z-10 bg-white"
                />
              )}
              <span className="text-xs mt-2 capitalize text-gray-600">
                {step}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-10 text-sm font-medium">
          This order was cancelled.
        </div>
      )}

      {order.trackingNumber && (
        <div className="border rounded-xl p-4 mb-8 text-sm">
          <span className="text-gray-500">Tracking Number: </span>
          <span className="font-medium">{order.trackingNumber}</span>
        </div>
      )}

      {/* PRODUCT ITEMS LIST */}
      <div className="space-y-4 mb-8">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 border-b pb-4">
            <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.size && `Size: ${item.size}`}{" "}
                {item.color && `· Color: ${item.color}`}
              </p>
              <p className="text-sm text-gray-500 mb-1">Qty: {item.quantity}</p>

              {isDelivered && (
                <div>
                  {item?.hasReviewed ? (
                    <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                      ✓ Reviewed
                    </span>
                  ) : (
                    <Link
                      href={`/product/${
                        typeof item.product === "object"
                          ? item.product._id
                          : item.product || item.productId
                      }`}
                      className="inline-block mt-2 text-xs font-medium text-black underline hover:text-gray-600 transition"
                    >
                      Write a review
                    </Link>
                  )}
                </div>
              )}
            </div>
            <span className="font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border rounded-2xl p-6 space-y-2 text-sm">
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

      <div className="border rounded-2xl p-6 mt-6 text-sm">
        <h3 className="font-semibold mb-2">Shipping Address</h3>
        <p className="text-gray-600">
          {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
          {order.shippingAddress.country}
        </p>
      </div>

      {/* CONFIRMATION MODAL */}
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


// ─── ORDER DETAIL SKELETON ────────────────────────────────────────────────────
function OrderDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded mb-6" />

      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
      </div>

      <div className="flex justify-between mb-10 items-center">
        {[1, 2, 3, 4, 5].map((step, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center relative">
            {idx > 0 && (
              <div className="absolute top-3 right-1/2 w-full h-0.5 bg-gray-200" />
            )}
            <div className="h-6 w-6 rounded-full bg-gray-200 relative z-10" />
            <div className="h-3 w-12 bg-gray-200 rounded mt-2" />
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b pb-4">
            <div className="h-20 w-20 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
            <div className="h-5 w-14 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className="border rounded-2xl p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        ))}
        <div className="border-t pt-3 flex justify-between">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="border rounded-2xl p-6 mt-6 space-y-2">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
