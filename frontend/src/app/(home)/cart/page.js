import { Suspense } from "react";
import CartClientPage from "@/components/cart/CartClientPage";

export const metadata = {
  title: "Shopping Cart | Payra",
  description:
    "Review the items in your cart, adjust quantities, and get ready to secure your favorite styles.",
};

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center text-gray-500">
          Loading…
        </div>
      }
    >
      <CartClientPage />
    </Suspense>
  );
}
