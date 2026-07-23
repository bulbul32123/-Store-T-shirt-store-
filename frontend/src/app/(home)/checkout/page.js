import { Suspense } from "react";
import CheckoutClientPage from "@/components/checkout/CheckoutClientPage";

export const metadata = {
  title: "Secure Checkout | Payra",
  description:
    "Finalize your order safely. Enter your delivery information and choice of payment method.",
};

export default function CheckoutPage() {
  return (
    <Suspense >
      <CheckoutClientPage />
    </Suspense>
  );
}
