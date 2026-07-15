import OrderDetailClient from "@/components/order/OrderDetailClient";
import { Suspense } from "react";

export const metadata = {
  title: "Order Details | Payra",
  description: "View your order tracking details and history status.",
};

export default async function OrderDetailPage() {
  return (
    <Suspense>
      <OrderDetailClient />
    </Suspense>
  );
}
