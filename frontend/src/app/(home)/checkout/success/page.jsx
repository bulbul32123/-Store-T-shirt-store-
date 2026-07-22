"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutSuccessRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      router.replace(`/checkout/success/${sessionId}`);
    } else {
      router.replace("/");
    }
  }, [router, searchParams]);
  

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-gray-500">Redirecting to order details...</p>
    </div>
  );
}
