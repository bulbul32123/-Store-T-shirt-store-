"use client";
import DeliveryAndTrust from "@/components/profile/cart/DeliveryAndTrust";
import FreeShippingProgress from "@/components/profile/cart/FreeShippingProgress";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartClientPage() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = 5;

  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center border border-dashed border-gray-300 rounded-3xl py-24">
          <div className="text-5xl mb-4">🛍️</div>

          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>

          <p className="text-gray-500 mb-8">Find something it can hold onto.</p>

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-8 py-3 font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pl-5 pr-5 md:pl-10 md:pr-10 border-b border-gray-300 py-10">
      <div className="mb-10 ">
        <h1 className="text-4xl font-bold">Cart</h1>

        <p className="text-gray-500 mt-2">{items.length} items</p>
      </div>
      <FreeShippingProgress subtotal={subtotal} threshold={100} />

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.lineId}
              className="flex gap-4 border-b border-gray-200 pb-6"
            >
              <Link href={`/product/${item.productId}`}>
                <div className="relative h-36 w-36 rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>

                <div className="text-sm text-gray-500 mt-1">
                  {item.size && <span>Size: {item.size}</span>}

                  {item.color && (
                    <div className="flex items-center gap-2 mt-1">
                      <span>Color</span>

                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 font-bold text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      updateQuantity(item.lineId, item.quantity - 1)
                    }
                    className="h-9 w-9 border rounded-full flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="font-medium min-w-[20px] text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.lineId, item.quantity + 1)
                    }
                    className="h-9 w-9 border rounded-full flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.lineId)}
                className="self-start"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="lg:sticky lg:top-24 border rounded-3xl p-6">
            <h2 className="font-bold text-xl mb-6">Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
              </div>{" "}
              <div className="flex justify-between">
                <span>Tax estimate</span>
                <span>${tax}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="w-full mt-6 bg-black text-white rounded-xl py-4 font-medium"
              onClick={() => router.push("/checkout")}
            >
              Proceed To Checkout
            </button>

            <DeliveryAndTrust />
          </div>
        </div>
      </div>
    </div>
  );
}
