import SupportBtn from "@/components/common/SupportBtn";
import Link from "next/link";

export const metadata = {
  title: "Delivery Info | Payra",
  description: "Shipping times, costs, and coverage for Payra orders.",
};

export default function DeliveryInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
        Delivery Info
      </h1>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Shipping Times
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Inside city limits: 1–3 business days</li>
            <li>Nationwide delivery: 3–7 business days</li>
            <li>Orders are processed within 24 hours of confirmation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Shipping Costs
          </h2>
          <p>
            Standard shipping is calculated at checkout based on your location.
            Orders above the free shipping threshold ship at no extra cost — the
            threshold is shown in your cart.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Order Tracking
          </h2>
          <p>
            Once your order ships, you&apos;ll receive a tracking number and a
            notification. You can also check your order status anytime from{" "}
            <Link href="/profile/orders" className="underline text-black">
              your orders page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Payment on Delivery
          </h2>
          <p>
            Cash on Delivery is available in select areas. You&apos;ll see this
            option at checkout if it&apos;s available for your address.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Delayed or Missing Orders
          </h2>
          <p>
            If your order is taking longer than expected, reach out through our
            <SupportBtn text={"support chat"} /> with your order number and
            we&apos;ll look into it right away.
          </p>
        </section>
      </div>
    </div>
  );
}
