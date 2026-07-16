"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { API_URL } from "@/utils/config";
import toast from "react-hot-toast";
import { RiAddLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductListSkeleton from "@/components/admin/LoadingSkeletons/ProductListSkeleton";

export default function ProductList() {
  const { user } = useAuth();
  const router = useRouter();
  const [heroProductIds, setHeroProductIds] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [bannerProductId, setBannerProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (search) params.append("search", search);

      const { data } = await axios.get(
        `${API_URL}/api/products?${params.toString()}`,
      );

      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts(data || []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchHeroSlides();
      fetchBanner();
    }
  }, [user, currentPage, search]); 
  

  const fetchBanner = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/banner`);
      setBannerProductId(data.banner?.product?._id || null);
    } catch (error) {
      console.error("Error fetching banner:", error);
    }
  };

  const handleEditRedirect = (product) => {
    router.push(`/admin/products/edit/${product._id}`);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
      throw error;
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/hero-slides`);
      setHeroProductIds(
        new Set(data.slides.map((s) => s.product?._id || s.product)),
      );
    } catch (error) {
      console.error("Error fetching hero slides:", error);
    }
  };

  if (loading && products.length === 0) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Products Inventory
          </h1>
          <p className="mt-1 text-gray-500 ">
            Manage and monitor your online store items
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#ffb803] text-black hover:bg-[#ffb803]/90 px-4 py-2 rounded-md text-sm font-medium flex items-center shrink-0"
        >
          <RiAddLine className="mr-1 text-lg" />
          Add Product
        </Link>
      </div>

      <div className="bg-white p-4 w-full rounded-lg border border-gray-200">
        <div className="max-w-xs relative">
          <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
            Search Name
          </label>
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Type product name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm outline-[#ffb803] focus:ring-[#ffb803] focus:border-[#ffb803]"
            />
          </div>
        </div>
      </div>

      {!loading && products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 text-center py-12 text-gray-500">
          <p className="text-lg font-medium">
            No products found matching filters
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear search string
            </button>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <ProductsTable
            products={products}
            onEdit={handleEditRedirect}
            heroProductIds={heroProductIds}
            onDelete={handleDeleteProduct}
            currentPage={currentPage}
            totalPages={totalPages}
            bannerProductId={bannerProductId}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
