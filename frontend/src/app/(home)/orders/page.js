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
    >
      <OrdersClientPage />
    </Suspense>
  );
}
