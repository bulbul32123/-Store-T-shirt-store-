export const metadata = {
  title: "Terms & Conditions | Payra",
  description: "The terms that govern your use of Payra.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
        Terms & Conditions
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Payra, you agree to be bound by these terms.
            If you do not agree, please do not use our site or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            2. Orders & Payment
          </h2>
          <p>
            All orders are subject to product availability. Prices are listed in
            the applicable currency and may change without notice. Payment is
            required at checkout via our supported payment methods, including
            card payment and cash on delivery where available.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            3. Shipping & Delivery
          </h2>
          <p>
            Delivery timelines are estimates and may vary based on location and
            courier availability. See our{" "}
            <a href="/deliveryinfo" className="underline text-black">
              Delivery Info
            </a>{" "}
            page for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            4. Cancellations
          </h2>
          <p>
            Orders can be cancelled from your account before they are marked as
            delivered. Once an order is delivered, cancellation is no longer
            available — please contact support for return options.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            5. Reviews & Conduct
          </h2>
          <p>
            Reviews must be based on genuine purchases. We reserve the right to
            remove reviews that violate our content guidelines, including spam,
            abusive language, or unrelated content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            6. Limitation of Liability
          </h2>
          <p>
            Payra is not liable for indirect or incidental damages arising from
            the use of our products or services, to the fullest extent permitted
            by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            7. Changes to These Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            site after changes constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
