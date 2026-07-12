"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const STATUS_FILTERS = [
  { name: "Featured", url: "/products?status=featured" },
    { name: "Sale", url: "/products?sale=true" },
  { name: "New Drops", url: "/products?status=newDrop" },
  { name: "Free Shipping", url: "/products?freeShipping=true" },
  { name: "Best Selling", url: "/products?status=bestselling" },
];

export default function MegaMenuFeatured() {
  return (
    <div>
      <p className="font-medium text-gray-900">Status</p>
      <ul className="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
        {STATUS_FILTERS.map((item, index) => (
          <motion.li
            className="flex"
            key={item.name}
            initial={{ y: index * 4 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href={item.url} className="hover:text-gray-800">
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
