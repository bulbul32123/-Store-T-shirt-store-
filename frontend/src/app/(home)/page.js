import axios from "axios";
import { cookies } from "next/headers";

import BrowseByCategory from "@/components/home/BrowseByCategory";
import Banner from "@/components/home/banners/Banner";
import Carousel from "@/components/home/carousel/Carousel";
import ProductCarousel from "@/components/home/carousel/productCarousel/ProductCarousel";

export const metadata = {
  title: "Payra | Bangladesh’s Favorite Online Clothing & Lifestyle Store",
  description:
    "Shop the latest streetwear and performance gear at Payra. Discover high-quality t-shirts, shirts, premium sneakers, sunglasses, and bags with fast delivery across Bangladesh.",
  openGraph: {
    title: "Payra | Premium Clothing & Streetwear Hub in Bangladesh",
    description:
      "Upgrade your wardrobe with our latest drops. Fast shipping, secure bkash/Rocket payments, and cash on delivery.",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Payra Online Store",
      },
    ],
  },
};

// Home pagee
export default async function Home() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString(); 

  const [{ data }, recRes] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations`, {
        headers: { Cookie: cookieHeader },
      })
      .catch(() => ({ data: { products: [] } })),
  ]);
  const heroRes = await axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}/api/hero-slides`)
    .catch(() => ({ data: { slides: [] } }));
  const carousel = heroRes.data.slides
    .filter((s) => s.image?.url)
    .map((s) => ({
      id: s._id,
      img: s.image.url,
      title: s.title || s.product?.name,
      tag: s.tag,
      product: s.product,
    }));

  const products = data.products || [];
  const recommendedProducts = recRes.data.products || [];

  const onSaleProducts = products.filter((product) => product.discount > 0);
  const featuredProducts = products.filter((product) => product.featured);
  const latestProducts = products.filter((product) => product.newDrop);
  const popularProducts = products.filter((product) => product.popular);
const bannerRes = await axios
  .get(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`)
  .catch(() => ({ data: { banner: null } }));
const bannerData = bannerRes.data.banner;


  return (
    <div className="w-full h-full pl-5 pr-5 md:pl-10 md:pr-10">
      <Carousel items={carousel} />

      {onSaleProducts.length > 0 && (
        <ProductCarousel
          status="sale"
          title="On Sale Now"
          products={onSaleProducts}
        />
      )}

      <BrowseByCategory />

       {recommendedProducts.length > 0 && (
        <ProductCarousel
          status="recommended"
          title="Recommandations"
          products={recommendedProducts}
        />
      )} 

      <ProductCarousel
        status="newDrop"
        title="Explore Latest"
        products={latestProducts}
      />
      <ProductCarousel
        status="featured"
        title="Featured"
        products={featuredProducts}
      />

      {bannerData && <Banner banner={bannerData} />}

      <ProductCarousel
        status="popular"
        title="Popular"
        products={popularProducts}
      />
    </div>
  );
}
