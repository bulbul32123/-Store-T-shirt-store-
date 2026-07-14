import { Suspense } from "react";
import OrdersClientPage from "@/components/order/OrdersClientPage";

export const metadata = {
  title: "My Orders | Payra",
  description:
    "View and track your past purchases, order status, and shipment details on Payra.",
};

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center text-gray-500">
          Loading…
        </div>
      }
    >
      <OrdersClientPage />
    </Suspense>
  );
}
