import OrderDetailClient from "@/components/order/OrderDetailClient";
import { Suspense } from "react";

export const metadata = {
      title: "Order Details | Payra",
      description: "View your order tracking details and history status.",
}

export default async function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center text-gray-500 animate-pulse">
          Loading order details layout…
        </div>
      }
    >
      <OrderDetailClient />
    </Suspense>
  );
}
