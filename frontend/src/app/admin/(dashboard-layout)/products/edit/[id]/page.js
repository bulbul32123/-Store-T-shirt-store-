"use client";
import ProductPromoModal from "@/components/admin/ProductPromoModal";
import ColorVariantsManager from "@/components/admin/products/ColorVariantsManager";
import ProductFormFields from "@/components/admin/products/ProductFormFields";
import ProductFormSkeleton from "@/components/admin/products/ProductFormSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProductForm } from "@/hooks/useProductForm";
import { API_URL } from "@/utils/config";
import { plainTextToHtml } from "@/utils/textToHtml";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Line } from "react-icons/ri";

export default function EditProduct({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroSlide, setHeroSlide] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [banner, setBanner] = useState(null);
  const [bannerOwnedByOther, setBannerOwnedByOther] = useState(false);

  const {
    formData,
    setFormData,
    handleChange,
    setDescription,
    setColors,
    validate,
    buildPayload,
  } = useProductForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const productRes = await axios.get(
          `${API_URL}/api/products/${params.id}`,
          config,
        );
        const product = productRes.data;

        setFormData({
          name: product.name || "",
          description: plainTextToHtml(product.description || ""),
          price: product.price || "",
          category: product.category._id || product.category || "",
          stock: product.stock || "",
          sizes: product.sizes || [],
          colors: product.colors || [],
          discount: product.discount || "0",
          featured: product.featured || false,
          newDrop: product.newDrop || false,
          popular: product.popular || false,
          isFreeShipping: product.isFreeShipping || false,
        });

        const categoriesRes = await axios.get(
          `${API_URL}/api/categories`,
          config,
        );
        setCategories(categoriesRes.data.categories);

        const heroRes = await axios.get(
          `${API_URL}/api/hero-slides/product/${params.id}`,
          config,
        );
        const bannerRes = await axios.get(
          `${API_URL}/api/banner/product/${params.id}`,
          config,
        );
        setBanner(bannerRes.data.banner);

        const currentBannerRes = await axios.get(
          `${API_URL}/api/banner/current-owner`,
          config,
        );
        const currentOwnerId = currentBannerRes.data.banner?.product?._id;
        setBannerOwnedByOther(!!currentOwnerId && currentOwnerId !== params.id);
        setHeroSlide(heroRes.data.slide);
      } catch (error) {
        toast.error("Failed to load product or categories");
        router.push("/admin/products");
      } finally {
        setInitialLoading(false);
      }
    };
    if (user && user.role === "admin") fetchData();
  }, [params.id, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      await axios.put(
        `${API_URL}/api/products/${params.id}`,
        buildPayload(),
        config,
      );
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <ProductFormSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setShowHeroModal(true)}
            className="bg-primary text-black hover:bg-primary/80"
          >
            {heroSlide ? "Edit Hero Carousel" : "Add to Hero Carousel"}
          </Button>
          {!bannerOwnedByOther && (
            <Button
              type="button"
              onClick={() => setShowBannerModal(true)}
              className="bg-primary text-black hover:bg-primary/80"
            >
              {banner ? "Edit Banner" : "Add to Banner"}
            </Button>
          )}
        </div>
      </div>

      {showHeroModal && (
        <ProductPromoModal
          type="hero"
          product={{ _id: params.id, name: formData.name }}
          existingItem={heroSlide}
          onClose={() => setShowHeroModal(false)}
          onSaved={(slide) => {
            setHeroSlide(slide);
            setShowHeroModal(false);
          }}
          onRemoved={() => {
            setHeroSlide(null);
            setShowHeroModal(false);
          }}
        />
      )}
      {showBannerModal && (
        <ProductPromoModal
          type="banner"
          product={{ _id: params.id, name: formData.name }}
          existingItem={banner}
          onClose={() => setShowBannerModal(false)}
          onSaved={(b) => {
            setBanner(b);
            setShowBannerModal(false);
          }}
          onRemoved={() => {
            setBanner(null);
            setShowBannerModal(false);
          }}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="p-6 space-y-6">
          <ProductFormFields
            formData={formData}
            handleChange={handleChange}
            setDescription={setDescription}
            categories={categories}
          />
          <div className="pt-4 border-t border-gray-100">
            <ColorVariantsManager
              colors={formData.colors}
              onChange={setColors}
              disabled={loading}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#ffb803] text-black hover:bg-[#ffb803]/90"
          >
            {loading ? (
              <>
                <RiLoader4Line className="animate-spin mr-2" /> Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
