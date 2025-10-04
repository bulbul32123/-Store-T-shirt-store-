"use client";

import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const CartPage = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Basic Tee", price: 60, size: "M", color: "Sienna", qty: 2, image: "/products/img-1.jpg" },
    { id: 2, name: "Basic Tee", price: 120, size: "M", color: "black", qty: 1, image: "/products/img-2.jpg" },
    { id: 3, name: "Nomad Tumbler", price: 30, color: "white", qty: 3, image: "/products/img-3.jpg" },
    { id: 4, name: "Throwback Hip Bag", price: 60, color: "red", qty: 4, image: "/products/img-4.jpg" },
  ]);

  const handleQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1) }
          : item
      )
    );
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-black flex justify-center pt-28">
      <div className="bg-white rounded-xl shadow-md p-6 w-[90%] max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm text-gray-500 flex gap-2 items-center">
                      Color:
                      <span
                        className={`w-4 h-4 rounded-full border`}
                        style={{ backgroundColor: item.color }}
                      ></span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.price}.00</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQty(item.id, "dec")}
                      className="p-1 border rounded"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => handleQty(item.id, "inc")}
                      className="p-1 border rounded"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg">
            Add Coupon Code →
          </button>
        </div>

        {/* Shopping Cart */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <span className="text-indigo-600 font-medium">{items.length} Items</span>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${subtotal}.00</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${subtotal}.00</span>
            </div>
          </div>

          <form className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="City"
              className="w-full border rounded-lg px-4 py-2"
              defaultValue="Rajkot"
            />
            <input
              type="text"
              placeholder="Promo Code"
              className="w-full border rounded-lg px-4 py-2"
              defaultValue="Nov 01, 2023"
            />
            <input
              type="text"
              placeholder="Address"
              className="w-full border rounded-lg px-4 py-2"
              defaultValue="Alpha Plus, Near Raiya Telephone exchange."
            />

            <div className="space-y-2">
              <p className="font-medium">Payment</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" />
                  Payment Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" defaultChecked />
                  Card Payment
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" />
                  PayPal Payment
                </label>
              </div>
              <button
                type="button"
                className="w-full border rounded-lg py-2 text-sm text-gray-600"
              >
                + Add Credit Card
              </button>
            </div>

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border rounded-lg px-4 py-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Expiry Date"
                className="w-full border rounded-lg px-4 py-2"
                defaultValue="Dec, 2025"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full border rounded-lg px-4 py-2"
                defaultValue="Rajkot"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                className="flex-1 border rounded-lg py-3 text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-3"
              >
                Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
