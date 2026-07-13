"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { FulfillmentBadge } from "@/components/StatusBadge";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function StatusUpdateModal({
  currentStatus,
  onClose,
  onConfirm,
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (selected === currentStatus) return onClose();
    setSaving(true);
    await onConfirm(selected, note);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Update Order Status
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setSelected(status)}
              disabled={currentStatus === "cancelled"}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition ${
                selected === status
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FulfillmentBadge status={status} />
              {selected === status && (
                <span className="text-xs text-blue-600 font-medium">
                  Selected
                </span>
              )}
            </button>
          ))}
        </div>

        {currentStatus === "cancelled" && (
          <p className="text-xs text-red-500 mb-4">
            This order is cancelled and its status can no longer be changed.
          </p>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional note (e.g. tracking info, reason)…"
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              saving ||
              currentStatus === "cancelled" ||
              selected === currentStatus
            }
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}
