"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ShopBy() {
  return (
    <div>
      <p className="font-medium text-gray-900">Shop By</p>
      <ul className="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
        <motion.li
          className="flex flex-col gap-4"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/products" className="hover:text-gray-800">
            All products
          </Link>{" "}
          <Link href="/products?status=popular" className="hover:text-gray-800">
            Popular
          </Link>{" "}
          <Link href="/products?status=newDrop" className="hover:text-gray-800">
            New Drops
          </Link>
        </motion.li>
      </ul>
    </div>
  );
}