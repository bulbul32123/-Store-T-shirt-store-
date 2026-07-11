"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/productsApi";
import MegaMenuFeatured from "./MegaMenuFeatured";
import ShopBy from "./ShopBy";
import ShopByCategory from "./ShopByCategory";

export default function MegaMenu() {
  const [categories, setCategories] = useState([]);
  const [showcaseProduct, setShowcaseProduct] = useState(null);

  useEffect(() => {
    // Fetch live categories from backend
    productsApi
      .getCategories()
      .then((data) => {
        // Handle array alignment safely based on your API logs
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));

    // Fetch the single latest product for the visual showcase slot
    productsApi
      .getProducts({ limit: 1 })
      .then((data) => {
        if (data?.products?.length > 0) {
          setShowcaseProduct(data.products[0]);
        }
      })
      .catch(() => setShowcaseProduct(null));
  }, []);

  // Safe image path resolution matching your ProductCard logic
  const displayImage =
    showcaseProduct?.colors?.[0]?.images?.[0]?.url ||
    showcaseProduct?.images?.[0]?.url ||
    showcaseProduct?.images?.[0] ||
    "/placeholder-product.png";

  return (
    <div>
      <header className="absolute w-full left-0 top-[3rem] z-30">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex items-center">
              <div className="lg:ml-8 lg:self-stretch">
                <div className="flex h-full space-x-8">
                  <div className="flex">
                    <div className="absolute inset-x-0 py-5 bg-white top-full text-sm text-gray-500">
                      <div className="absolute inset-0 top-1/2 shadow"></div>

                      <div className="relative bg-white">
                        <div className="mx-auto max-w-7xl px-8">
                          <div className="py-5 w-full">
                            <div className="flex justify-center items-start flex-wrap gap-8 md:gap-12 w-full gap-y-10 text-sm">
                              {/* 1. Status Filter Column */}
                              <MegaMenuFeatured />

                              {/* 2. Simplified Shop By Column */}
                              <ShopBy />

                              {/* 3. Live Database Categories Column */}
                              <ShopByCategory categories={categories} />

                              {/* 4. Live Showcase Product Card */}
                              {showcaseProduct && (
                                <div className="max-lg:hidden flex">
                                  <Link
                                    href={`/product/${showcaseProduct._id}`}
                                    className="group relative text-base sm:text-sm max-sm:mt-3"
                                  >
                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                      <img
                                        src={displayImage}
                                        alt={showcaseProduct.name}
                                        className="object-cover object-center h-60 w-60"
                                      />
                                    </div>
                                    <h2 className="mt-1 ml-1 block font-medium text-gray-900 max-w-[240px] truncate">
                                      {showcaseProduct.name}
                                    </h2>
                                    <span className="mt-2 font-base py-1.5 bg-black px-3 text-white rounded-full absolute top-3 left-3 text-xs">
                                      New Arrivals
                                    </span>
                                    <button className="mt-1 absolute bottom-10 left-3 py-1 px-2 border border-black rounded-sm bg-white text-xs font-medium">
                                      Shop now
                                    </button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
