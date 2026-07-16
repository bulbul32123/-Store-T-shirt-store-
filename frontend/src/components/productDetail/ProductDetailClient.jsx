"use client";
import ProductReviews from "@/components/review/ProductReviews";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { setBuyNowItem } from "@/lib/buyNow";
import { computeFinalPrice } from "@/utils/pricing";
import { getImageForColor } from "@/utils/productImage";
import axios from "axios";
import DOMPurify from "dompurify";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTruck,
  FiX,
} from "react-icons/fi";
const getImageUrl = (img) =>
  (typeof img === "string" ? img : img?.url) || "/images/placeholder.jpg";

export default function ProductDetailClient() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState("cm"); // cm or in

  const { addToCart } = useCart();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
        );
        setProduct(data);

        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0].name);

        setActiveImage(0);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const currentImages = useMemo(() => {
    if (!product) return [];

    if (selectedColor && product.colors?.length) {
      const colorObj = product.colors.find((c) => c.name === selectedColor);
      if (colorObj?.images?.length) {
        return colorObj.images.map((img) => getImageUrl(img));
      }
    }
    return (product.images || []).map((img) => getImageUrl(img));
  }, [product, selectedColor]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  const handleColorChange = (colorName) => setSelectedColor(colorName);

  const handleQuantityChange = (delta) => {
    const next = quantity + delta;
    if (next > 0 && next <= product.stock) setQuantity(next);
  };

  // inside the component, alongside your other hooks
  const router = useRouter();

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;

    const resolvedColor = selectedColor || product.colors?.[0]?.name || null;
    const image = getImageForColor(product, resolvedColor);
    const lineId = `${product._id}-${selectedSize}-${resolvedColor}`;

    setBuyNowItem({
      lineId,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: computeFinalPrice(product),
      image,
      size: selectedSize,
      color: resolvedColor,
      quantity,
      addedAt: Date.now(),
    });

    router.push("/checkout?buynow=1");
  };

  const nextImage = () => {
    if (currentImages.length > 1) {
      setActiveImage((prev) =>
        prev === currentImages.length - 1 ? 0 : prev + 1,
      );
    }
  };
  const prevImage = () => {
    if (currentImages.length > 1) {
      setActiveImage((prev) =>
        prev === 0 ? currentImages.length - 1 : prev - 1,
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-4 py-8 mt-2 bg-white animate-pulse">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-gray-200 w-full" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-md bg-gray-200 flex-shrink-0"
                />
              ))}
            </div>
          </div>
          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-16 h-16 rounded-md bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-10" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-11 w-14 bg-gray-200 rounded-md" />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <div className="flex-1 h-14 bg-gray-200 rounded-md" />
              <div className="flex-1 h-14 bg-gray-200 rounded-md" />
              <div className="h-14 w-14 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center mt-16">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || "Product not found"}</p>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : null;
  const displayPrice = discountedPrice ?? product.price;
  const reviewCount = product.numReviews ?? product.ratings?.length ?? 0;
  const inWatchlist = isInWatchlist(product?._id);

  const sizeChartData = [
    {
      size: "XS",
      cm: { chest: "80-88", waist: "65-73", hip: "80-88" },
      in: { chest: "31.5-35", waist: "25.5-28.5", hip: "31.5-35" },
    },
    {
      size: "S",
      cm: { chest: "88-96", waist: "73-81", hip: "88-96" },
      in: { chest: "35-38", waist: "28.5-32", hip: "35-38" },
    },
    {
      size: "M",
      cm: { chest: "96-104", waist: "81-89", hip: "96-104" },
      in: { chest: "38-41", waist: "32-35", hip: "38-41" },
    },
    {
      size: "L",
      cm: { chest: "104-112", waist: "89-97", hip: "104-112" },
      in: { chest: "41-44", waist: "35-38", hip: "41-44" },
    },
    {
      size: "XL",
      cm: { chest: "112-124", waist: "97-109", hip: "112-120" },
      in: { chest: "44-48.5", waist: "38-43", hip: "44-47" },
    },
    {
      size: "XXL",
      cm: { chest: "124-136", waist: "109-121", hip: "120-128" },
      in: { chest: "48.5-53.5", waist: "43-47.5", hip: "47-50.5" },
    },
    {
      size: "3XL",
      cm: { chest: "136-148", waist: "121-133", hip: "128-136" },
      in: { chest: "53.5-58", waist: "47.5-52.5", hip: "50.5-53.5" },
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-4 py-8 mt-2 bg-white">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImages[activeImage] || "/images/placeholder.jpg"}
              alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ""}`}
              className="w-full h-full object-cover"
            />

            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 text-gray-800 transition-colors"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 text-gray-800 transition-colors"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </span>
            )}

            {currentImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {activeImage + 1} / {currentImages.length}
              </div>
            )}
          </div>

          {currentImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {currentImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    activeImage === idx
                      ? "border-gray-900"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.numReviews > 0 && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.averageRating || 0)
                          ? "fill-current text-gray-900"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-900">
                    {(product.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} reviews)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
            {discountedPrice !== null && (
              <span className="text-lg text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
            {product.isFreeShipping && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                Free Shipping
              </span>
            )}
          </div>
          {product.colors?.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-900">Color</span>
              <div className="flex gap-2 pb-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.name)}
                    title={color.name}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-gray-900 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(color.images?.[0])}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute bottom-1 right-1 h-3 w-3 rounded-full border border-white shadow"
                      style={{ backgroundColor: color.code }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Size</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-sm text-gray-500 underline decoration-gray-400 hover:text-black font-medium transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={product.stock === 0}
                    className={`h-11 px-4 text-sm font-medium rounded-md border transition-all ${
                      selectedSize === size
                        ? "bg-gray-900 text-white border-gray-900"
                        : product.stock === 0
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-900 hover:border-gray-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-900">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 h-14 rounded-md font-medium bg-gray-900 text-white border border-gray-900 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button
              onClick={() =>
                addToCart(product, {
                  size: selectedSize,
                  color: selectedColor,
                  quantity,
                })
              }
              disabled={product.stock === 0}
              className="flex-1 h-14 rounded-md font-medium border border-gray-300 text-gray-900 transition-colors hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() =>
                toggleWatchlist(product, {
                  size: selectedSize,
                  color: selectedColor,
                })
              }
              className="h-14 w-14 flex-shrink-0 inline-flex items-center justify-center rounded-md bg-gray-900 text-white transition-colors"
            >
              <FiHeart
                className={`h-5 w-5 ${inWatchlist ? "fill-current" : ""}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <FiTruck className="h-5 w-5 mx-auto text-gray-500 mb-1" />
              <span className="text-xs text-gray-500">
                {product.isFreeShipping
                  ? "Free Delivery"
                  : "Standard Delivery 50TK"}
              </span>
            </div>
            <div className="text-center">
              <FiRefreshCw className="h-5 w-5 mx-auto text-gray-500 mb-1" />
              <span className="text-xs text-gray-500">7-Day Returns</span>
            </div>
            <div className="text-center">
              <FiShield className="h-5 w-5 mx-auto text-gray-500 mb-1" />
              <span className="text-xs text-gray-500">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Size Guide</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Find your perfect body measurement alignment
                </p>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black rounded-full transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex justify-end">
                <div className="bg-gray-100 p-0.5 rounded-lg inline-flex items-center border">
                  <button
                    onClick={() => setSizeUnit("cm")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      sizeUnit === "cm"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Metric (cm)
                  </button>
                  <button
                    onClick={() => setSizeUnit("in")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      sizeUnit === "in"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Imperial (in)
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 font-semibold border-b border-gray-200 text-gray-700">
                      <th className="py-3.5 px-4">Size</th>
                      <th className="py-3.5 px-4">Chest</th>
                      <th className="py-3.5 px-4">Waist</th>
                      <th className="py-3.5 px-4">Hips</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {sizeChartData.map((row) => (
                      <tr
                        key={row.size}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          selectedSize === row.size
                            ? "bg-gray-50 font-medium text-black"
                            : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {row.size}
                        </td>
                        <td className="py-3.5 px-4">{row[sizeUnit].chest}</td>
                        <td className="py-3.5 px-4">{row[sizeUnit].waist}</td>
                        <td className="py-3.5 px-4">{row[sizeUnit].hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-3 leading-relaxed">
                <p className="font-bold text-gray-900 text-sm mb-1">
                  How To Measure
                </p>
                <div>
                  <span className="font-semibold text-gray-900 block">
                    1. Chest:
                  </span>
                  Measure around the fullest part of your chest, keeping the
                  measuring tape horizontal.
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">
                    2. Waist:
                  </span>
                  Measure around the narrowest part (typically where your body
                  bends side to side), keeping the tape horizontal.
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">
                    3. Hips:
                  </span>
                  Measure around the fullest part of your hips, keeping the tape
                  horizontal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 border-t-2 border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "description"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "reviews"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500"
            }`}
          >
            Reviews ({reviewCount})
          </button>
        </div>

        {activeTab === "reviews" && (
          <div className="py-6">
            <ProductReviews product={product} />
          </div>
        )}

        {activeTab === "description" && (
          <div
            className="py-6 max-w-3xl prose prose-sm prose-gray"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.description || ""),
            }}
          />
        )}
      </div>
    </div>
  );
}
