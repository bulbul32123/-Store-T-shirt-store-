import { Suspense } from "react";
import CheckoutClientPage from "@/components/checkout/CheckoutClientPage";

export const metadata = {
  title: "Secure Checkout | Payra",
  description:
    "Finalize your order safely. Enter your delivery information and choice of payment method.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center text-gray-500">
          Loading…
        </div>
      }
    >
      <CheckoutClientPage />
    </Suspense>
  );
}
