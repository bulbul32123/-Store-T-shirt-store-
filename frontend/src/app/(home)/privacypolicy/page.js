export const metadata = {
  title: "Privacy Policy | Payra",
  description: "How Payra collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            1. Information We Collect
          </h2>
          <p>
            When you create an account, place an order, or contact support, we
            collect information such as your name, email address, phone number,
            shipping address, and order history. Payment details are processed
            securely by our payment provider and are never stored on our
            servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and deliver your orders</li>
            <li>To send order updates and respond to support requests</li>
            <li>To improve our products and shopping experience</li>
            <li>To send promotional offers, only if you&apos;ve opted in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            3. Data Sharing
          </h2>
          <p>
            We do not sell your personal information. We share data only with
            service providers necessary to run our store — such as payment
            processors and delivery partners — and only to the extent needed to
            fulfill your order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">4. Cookies</h2>
          <p>
            We use cookies to keep you logged in, remember your cart, and
            understand how our site is used. You can disable cookies in your
            browser settings, though some features may not work correctly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            5. Your Rights
          </h2>
          <p>
            You can access, update, or request deletion of your personal data at
            any time from your profile settings, or by contacting our support
            team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            6. Contact Us
          </h2>
          <p>
            Questions about this policy? Reach out through our support chat or
            email us directly.
          </p>
        </section>
      </div>
    </div>
  );
}
