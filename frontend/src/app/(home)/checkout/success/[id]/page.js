import ClientStripeSuccessPage from "@/components/checkout/ClientStripeSuccessPage";
import { Suspense } from "react";

export const metadata = {
  title: "Order Confirmed | Payra",
  description:
    "Thank you for your purchase! Your payment has been successfully verified and processed.",
  robots: {
    index: false,
    follow: false, 
  },
};

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
          Loading confirmation layout...
        </div>
      }
    >
      <ClientStripeSuccessPage />
    </Suspense>
  );
}
