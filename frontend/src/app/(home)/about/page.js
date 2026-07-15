import SupportBtn from "@/components/common/SupportBtn";

export const metadata = {
  title: "About Us | Payra",
  description: "Learn more about Payra and our mission.",
};

export default function AboutPage() {
 
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">About Payra</h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Payra started with a simple idea: modern, comfortable t-shirts that
          don&apos;t compromise on quality or style. What began as a small
          project has grown into a store trusted by customers who care about how
          their clothes are made and how they fit.
        </p>

        <p>
          Every piece in our collection is chosen with care — from fabric weight
          to color accuracy — because we believe great basics deserve the same
          attention as statement pieces.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-gray-900">
          Our Mission
        </h2>
        <p>
          To make quality apparel accessible without the markup, and to build a
          shopping experience that respects your time and your trust.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-gray-900">
          What We Stand For
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Honest pricing, no hidden fees</li>
          <li>Fast, reliable delivery across the region</li>
          <li>Real support from real people — chat with us anytime</li>
          <li>Products we&apos;d wear ourselves</li>
        </ul>

        <p className="pt-4">
          Have questions? Reach out through our support chat — we&apos;re always
          happy to
          
          <SupportBtn text='help'/>.
        </p>
      </div>
    </div>
  );
}
