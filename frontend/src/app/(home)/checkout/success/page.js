"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Look for session_id or order_id in query parameters (e.g. /checkout/success?session_id=123)
    const sessionId = searchParams.get("session_id") || searchParams.get("id");

    if (sessionId) {
      // Redirect to your dynamic route: /checkout/success/[id]
      router.replace(`/checkout/success/${sessionId}`);
    } else {
      // Fallback if no ID is attached
      router.replace("/");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-gray-500">Redirecting to your order details...</p>
    </div>
  );
}
