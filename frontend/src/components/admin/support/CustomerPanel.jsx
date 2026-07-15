
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar"; // 👈 Import here

export default function CustomerPanel({ chat, collapsed, onToggleCollapse }) {

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col items-center py-3">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    );
  }

  if (!chat) {
    return null;
  }

  const u = chat.user || {};
  const addr = u.address;

  return (
    <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Customer Details</h3>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col items-center py-5 border-b border-gray-100">
        {/* 👈 Reusable avatar setup with matching layout sizes */}
        <UserAvatar
          user={u}
          size="h-16 w-16"
          textSize="text-xl"
          className="mb-2"
        />

        <p className="text-sm font-semibold text-gray-900">
          {u.name || "Unknown"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Storefront customer</p>
      </div>

      <div className="px-4 py-4 space-y-3.5 border-b border-gray-100">
        <div className="flex items-start gap-2.5">
          <Hash className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Customer ID
            </p>
            <p className="text-xs text-gray-700 break-all">{u._id}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Mail className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Email
            </p>
            <p className="text-xs text-gray-700 break-all">{u.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Phone
            </p>
            <p className="text-xs text-gray-700">{u.phone || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Address
            </p>
            <p className="text-xs text-gray-700">
              {addr?.street
                ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
