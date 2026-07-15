"use client";
import ProductCardShop from "@/components/shop/ProductCardShop";
import ShopPagination from "@/components/shop/ShopPagination";
import ShopSidebar from "@/components/shop/ShopSidebar";
import ShopTopbar from "@/components/shop/ShopTopbar";
import { productsApi } from "@/lib/productsApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const SkeletonCard = () => {
  return (
    <div className="animate-pulse space-y-3">
      <div className="w-full h-[19rem] rounded-2xl bg-gray-100" />
      <div className="h-3 w-1/3 bg-gray-100 rounded" />
      <div className="h-4 w-2/3 bg-gray-100 rounded" />
      <div className="h-4 w-1/4 bg-gray-100 rounded" />
    </div>
  );
};

export const ProductsPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = {
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    colors: searchParams.get("colors")
      ? searchParams.get("colors").split(",")
      : [],
    sizes: searchParams.get("sizes")
      ? searchParams.get("sizes").split(",")
      : [],
    sort: searchParams.get("sort") || "",
    page: Number(searchParams.get("page")) || 1,
    minRating: searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : "",

    freeShipping: searchParams.get("freeShipping") === "true",
    sale: searchParams.get("sale") === "true",
    status: searchParams.get("status") || "",
  };

  // Pending filters (sidebar edits before "Apply Filter" is pressed)
  const [pendingFilters, setPendingFilters] = useState(filters);
  useEffect(() => {
    setPendingFilters(filters); /* eslint-disable-next-line */
  }, [searchParams.toString()]);

  const pushFilters = useCallback(
    (next) => {
      const params = new URLSearchParams();
      if (next.category) params.set("category", next.category);
      if (next.minPrice != null) params.set("minPrice", next.minPrice);
      if (next.maxPrice != null) params.set("maxPrice", next.maxPrice);
      if (next.colors?.length) params.set("colors", next.colors.join(","));
      if (next.sizes?.length) params.set("sizes", next.sizes.join(","));
      if (next.sort) params.set("sort", next.sort);
      if (next.page && next.page > 1) params.set("page", next.page);
      if (next.minRating) params.set("minRating", next.minRating);
      if (next.freeShipping) params.set("freeShipping", "true");
      if (next.sale) params.set("sale", "true");
      if (next.status) params.set("status", next.status);
      router.push(`/products?${params.toString()}`);
    },
    [router],
  );

  // Category clicks apply immediately (feels like navigation); price/color/size wait for "Apply Filter"
  const handleSidebarChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    if (
      key === "category" ||
      key === "status" ||
      key === "freeShipping" ||
      key === "sale"
    ) {
      pushFilters({ ...pendingFilters, [key]: value, page: 1 });
    }
  };

  const handleApply = () => pushFilters({ ...pendingFilters, page: 1 });
  const handleSortChange = (sort) => pushFilters({ ...filters, sort, page: 1 });
  const handlePageChange = (page) => {
    pushFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    productsApi
      .getProducts({
        // 1. Clean backend API call (No 'sale' parameter passed here)
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        colors: filters.colors.join(","),
        sizes: filters.sizes.join(","),
        sort: filters.sort,
        page: filters.page,
        minRating: filters.minRating,
        freeShipping: filters.freeShipping || undefined,
        status: filters.status,
        limit: 12,
      })
      .then((data) => {
        let localProducts = data.products || [];

        // 2. Client-side recalculation: Filter out items without discounts
        if (filters.sale) {
          localProducts = localProducts.filter(
            (product) => Number(product.discount || 0) > 0,
          );
        }

        setProducts(localProducts);

        // 3. Recalculate pagination totals seamlessly based on the filtered results
        setPagination({
          currentPage: data.currentPage,
          totalPages: filters.sale
            ? Math.ceil(localProducts.length / 12) || 1
            : data.totalPages,
          total: filters.sale ? localProducts.length : data.total,
        });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    productsApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    productsApi
      .getAvailableColors()
      .then(setAvailableColors)
      .catch(() => setAvailableColors([]));
  }, []);

  // The Array.isArray check ensures it won't crash even if state isn't an array yet
  const STATUS_LABELS = {
    featured: "Featured",
    popular: "Popular",
    newDrop: "New Drop",
    bestselling: "Best Selling",
  };
  const activeCategory = Array.isArray(categories)
    ? categories.find((c) => c._id === filters.category)
    : null;
  const pageTitle =
    activeCategory?.name ||
    STATUS_LABELS[filters.status] ||
    (filters.sale ? "Sale" : "Shop");
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium"
      >
        Filters
      </button>

      <div className="flex gap-10">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <ShopSidebar
            categories={categories}
            availableColors={availableColors}
            filters={pendingFilters}
            onChange={handleSidebarChange}
            onApply={handleApply}
          />
        </div>

        {/* Sidebar — mobile drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white p-5 overflow-y-auto">
              <ShopSidebar
                categories={categories}
                availableColors={availableColors}
                filters={pendingFilters}
                onChange={handleSidebarChange}
                onApply={() => {
                  handleApply();
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <ShopTopbar
            title={pageTitle}
            total={pagination.total}
            sort={filters.sort}
            onSortChange={handleSortChange}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
            {loading
              ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
              : products.map((product) => (
                  <ProductCardShop
                    key={product._id}
                    product={product}
                    selectedFilters={filters.colors}
                  />
                ))}
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-24 text-gray-500">
              No products match these filters.
            </div>
          )}

          {!loading && (
            <ShopPagination
              page={pagination.currentPage}
              pages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
