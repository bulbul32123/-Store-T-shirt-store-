"use client";
import { FulfillmentBadge, PaymentBadge } from "@/components/StatusBadge";
import StatusUpdateModal from "@/components/admin/orders/StatusUpdateModal";
import { adminOrdersApi } from "@/lib/adminOrdersApi";
import { Archive, ArchiveRestore, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function formatDate(iso, opts = {}) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...opts,
  });
}
function money(v) {
  return `$${Number(v || 0).toFixed(2)}`;
}

function AddressBlock({ title, address }) {
  if (!address || !address.street) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-sm text-gray-400">Not provided</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {title}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">
        {address.street}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </p>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded mb-4" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="h-3.5 w-40 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 h-9" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-3 border-t border-gray-100"
                >
                  <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded" />
                  </div>
                  <div className="h-3.5 w-10 bg-gray-100 rounded" />
                  <div className="h-3.5 w-6 bg-gray-100 rounded" />
                  <div className="h-3.5 w-12 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <div className="w-56 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-3 w-12 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-200 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-36 bg-gray-100 rounded" />
                    </div>
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-36 bg-gray-200 rounded mb-3" />
            <div className="h-20 w-full bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3.5 w-32 bg-gray-200 rounded" />
              <div className="h-3.5 w-24 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1.5">
            <div className="h-3 w-24 bg-gray-100 rounded mb-1" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1.5">
            <div className="h-3 w-20 bg-gray-100 rounded mb-1" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-2/3 bg-gray-200 rounded mb-3" />
            <div className="border-t border-gray-100 pt-3">
              <div className="h-3 w-14 bg-gray-100 rounded mb-1" />
              <div className="h-3.5 w-28 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handleArchiveToggle = async () => {
    setArchiving(true);
    try {
      await adminOrdersApi.updateOrder(id, { isArchived: !order.isArchived });
      toast.success(order.isArchived ? "Order restored" : "Order archived");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update archive status");
    } finally {
      setArchiving(false);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    adminOrdersApi
      .getById(id)
      .then((data) => {
        setOrder(data);
        setNotes(data.internalNotes || "");
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (newStatus, note) => {
    try {
      await adminOrdersApi.updateOrder(id, {
        orderStatus: newStatus,
        statusNote: note,
      });
      toast.success(`Order marked as ${newStatus}`);
      setStatusModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const saveNotes = async () => {
    try {
      await adminOrdersApi.updateOrder(id, { internalNotes: notes });
      toast.success("Notes saved");
    } catch (err) {
      toast.error(err.message || "Failed to save notes");
    }
  };

  if (loading || !order) {
    return <OrderDetailSkeleton />;
  }

  const displayName = order.user?.name || "Deleted customer";
  const initials = displayName[0]?.toUpperCase() || "?";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {statusModalOpen && (
        <StatusUpdateModal
          currentStatus={order.orderStatus}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleStatusUpdate}
        />
      )}

      <button
        onClick={() => router.push("/admin/orders")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              {order.displayId}
            </h1>
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.orderStatus} />
            {order.isArchived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <Archive className="h-3 w-3" /> Archived
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleArchiveToggle}
            disabled={archiving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {archiving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : order.isArchived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            {order.isArchived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={() => setStatusModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Order details
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                      Products
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">
                      Price
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.orderItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200" />
                          )}
                          <div>
                            <p className="text-gray-900 font-medium">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.size} · {item.color}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700">
                        {money(item.price)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                        {money(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-3">
              <div className="w-56 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{money(order.itemsPrice)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>-{money(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>{money(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>{money(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{money(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Shipping activity
            </h3>
            {!order.statusHistory || order.statusHistory.length === 0 ? (
              <p className="text-sm text-gray-400">
                No status changes recorded yet.
              </p>
            ) : (
              <div className="space-y-0">
                {[...order.statusHistory].reverse().map((h, idx, arr) => (
                  <div key={idx} className="flex gap-3 pb-5 last:pb-0 relative">
                    {idx !== arr.length - 1 && (
                      <span className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200" />
                    )}
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0 z-10" />
                    <div className="flex-1 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {h.status}
                        </p>
                        {h.note && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {h.note}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(h.changedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Internal admin notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes visible only to admins…"
              className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={saveNotes}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              <Check className="h-3.5 w-3.5" /> Save note
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Customer details
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ background: "#6366f1" }}
              >
                {order.user?.avatar || order.user?.profilePicture?.url ? (
                  <img
                    src={order.user.avatar || order.user.profilePicture.url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">
                  Customer ID: #{order.user?._id?.slice(-6) || "—"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {order.customerOrderCount} order
              {order.customerOrderCount !== 1 ? "s" : ""} total
            </p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Contact info
              </p>
              <p className="text-sm text-gray-700">
                {order.user?.email || "—"}
              </p>
              <p className="text-sm text-gray-700">
                {order.phone || order.user?.phone || "Not provided"}
              </p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <AddressBlock
              title="Shipping address"
              address={order.shippingAddress}
            />
          </div>

          {/* Billing / payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <AddressBlock
              title="Billing address"
              address={
                order.billingAddress?.street
                  ? order.billingAddress
                  : order.shippingAddress
              }
            />
            <div className="border-t border-gray-100 mt-3 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Payment
              </p>
              <p className="text-sm text-gray-700 capitalize">
                {order.paymentMethod === "card"
                  ? "Card (Stripe)"
                  : order.paymentMethod}
              </p>
              {order.paymentResult?.id && (
                <p className="text-xs text-gray-400 mt-0.5 break-all">
                  Ref: {order.paymentResult.id}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
