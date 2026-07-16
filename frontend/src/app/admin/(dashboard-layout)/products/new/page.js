"use client";
import ProductPromoModal from "@/components/admin/ProductPromoModal";
import ColorVariantsManager from "@/components/admin/products/ColorVariantsManager";
import ProductFormFields from "@/components/admin/products/ProductFormFields";
import ProductFormSkeleton from "@/components/admin/products/ProductFormSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProductForm } from "@/hooks/useProductForm";
import { API_URL } from "@/utils/config";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Line } from "react-icons/ri";

export default function NewProduct() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [banner, setBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [bannerOwnedByOther, setBannerOwnedByOther] = useState(false);

  const {
    formData,
    handleChange,
    setDescription,
    setColors,
    validate,
    buildPayload,
  } = useProductForm();
  const [heroSlide, setHeroSlide] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setInitialLoading(true);
        const { data } = await axios.get(`${API_URL}/api/categories`);
        setCategories(data.categories);
      } catch (error) {
        toast.error("Failed to load categories. Please refresh the page.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (user && user.role === "admin") fetchCategories();
  }, [user]);

  const handleAddToBannerClick = async () => {
    if (createdProduct) {
      setShowBannerModal(true);
      return;
    }
    const error = validate();
    if (error) return toast.error(error);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/products`,
        buildPayload(),
      );
      setCreatedProduct(data.product);
      toast.success("Product saved — now add your banner image");
      setShowBannerModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };
  const handleAddToHeroClick = async () => {
    if (createdProduct) {
      setShowHeroModal(true);
      return;
    }
    const error = validate();
    if (error) return toast.error(error);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/products`,
        buildPayload(),
      );
      setCreatedProduct(data.product);
      toast.success("Product saved — now add your hero image");
      setShowHeroModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      if (createdProduct) {
        toast.success("Product created successfully");
        router.push("/admin/products");
        return;
      }
      await axios.post(`${API_URL}/api/products`, buildPayload());
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkBanner = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/banner/current-owner`);
        setBannerOwnedByOther(!!data.banner);
      } catch {}
    };
    if (user && user.role === "admin") checkBanner();
  }, [user]);

  if (initialLoading) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleAddToHeroClick}
            disabled={loading}
            className="bg-primary text-black hover:bg-primary/80"
          >
            {createdProduct ? "Edit Hero Carousel" : "Add to Hero Carousel"}
          </Button>
          {!bannerOwnedByOther && (
            <Button
              type="button"
              onClick={handleAddToBannerClick}
              disabled={loading}
              className="bg-primary text-black hover:bg-primary/80"
            >
              {createdProduct ? "Edit Banner" : "Add to Banner"}
            </Button>
          )}
        </div>
      </div>
      {showHeroModal && createdProduct && (
        <ProductPromoModal
          type="hero"
          product={createdProduct}
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
      {showBannerModal && createdProduct && (
        <ProductPromoModal
          type="banner"
          product={createdProduct}
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
                <RiLoader4Line className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
