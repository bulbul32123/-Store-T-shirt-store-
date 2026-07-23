import { Suspense } from "react";
import CartClientPage from "@/components/cart/CartClientPage";

export const metadata = {
  title: "Shopping Cart | Payra",
  description:
    "Review the items in your cart, adjust quantities, and get ready to secure your favorite styles.",
};

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartClientPage />
    </Suspense>
  );
}

function CartSkeleton() {
  return (
    <div className="max-w-7xl mx-auto pl-5 pr-5 md:pl-10 md:pr-10 border-b border-gray-300 py-10 animate-pulse">
      
      <div className="mb-10">
        <div className="h-10 w-24 bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 w-16 bg-gray-200 rounded-md" />
      </div>

      
      <div className="mb-10 bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-3">
        <div className="h-5 w-64 bg-gray-200 rounded-md" />
        <div className="h-2 w-full bg-gray-200 rounded-full" />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 border-b border-gray-200 pb-6">
              
              <div className="h-36 w-36 rounded-2xl bg-gray-200 flex-shrink-0" />

              
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/2 bg-gray-200 rounded-md" />
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="h-6 w-16 bg-gray-200 rounded-md mt-3" />
                
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-9 w-9 bg-gray-200 rounded-full" />
                  <div className="h-5 w-5 bg-gray-200 rounded-md" />
                  <div className="h-9 w-9 bg-gray-200 rounded-full" />
                </div>
              </div>

              
              <div className="h-5 w-5 bg-gray-200 rounded-md self-start" />
            </div>
          ))}
        </div>


        <div>
          <div className="border rounded-3xl p-6 space-y-6">
            <div className="h-6 w-24 bg-gray-200 rounded-md" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
                <div className="h-4 w-12 bg-gray-200 rounded-md" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
                <div className="h-4 w-12 bg-gray-200 rounded-md" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-8 bg-gray-200 rounded-md" />
              </div>
              <div className="border-t pt-4 flex justify-between">
                <div className="h-5 w-12 bg-gray-200 rounded-md" />
                <div className="h-5 w-16 bg-gray-200 rounded-md" />
              </div>
            </div>

            
            <div className="w-full h-14 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
