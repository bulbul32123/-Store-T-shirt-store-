import axios from "axios";
import { cookies } from "next/headers";

import BrowseByCategory from "@/components/home/BrowseByCategory";
import Banner from "@/components/home/banners/Banner";
import Carousel from "@/components/home/carousel/Carousel";
import ProductCarousel from "@/components/home/carousel/productCarousel/ProductCarousel";

export const metadata = {
  title: "T-Shirt Store | Home",
  description: "Find the perfect t-shirt for any occasion",
};

const carousel = [
  {
    id: 1,
    img: "/banner.png",
    title: "Nike Air Max",
    description: "More Air, less bulk...",
    price: 1360,
  },
  {
    id: 2,
    img: "/banner2.png",
    title: "Nike Air 23",
    description: "More Air, less bulk...",
    price: 1260,
  },
  {
    id: 3,
    img: "/banner3.png",
    title: "Nike Air 45",
    description: "More Air 45, less bulk...",
    price: 960,
  },
  {
    id: 4,
    img: "/banner4.webp",
    title: "Nike Air 56",
    description: "More Air, less bulk...",
    price: 760,
  },
];

export default async function Home() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString(); // forward the session cookie for personalized recs

  const [{ data }, recRes] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations`, {
        headers: { Cookie: cookieHeader },
      })
      .catch(() => ({ data: { products: [] } })), // never break the homepage if this fails
  ]);

  const products = data.products || [];
  const recommendedProducts = recRes.data.products || [];

  const onSaleProducts = products.filter((product) => product.discount > 0);
  const featuredProducts = products.filter((product) => product.featured);
  const latestProducts = products.filter((product) => product.newDrop);
  const popularProducts = products.filter((product) => product.popular);

  const bannerData = {
    id: 1,
    img: "/banner3.png",
    title: "Nike Air Max",
    description: "More Air, less bulk...",
    price: 1360,
  };

  return (
    <div className="w-full h-full pl-5 pr-5 md:pl-10 md:pr-10">
      <Carousel items={carousel} />

      {onSaleProducts.length > 0 && (
        <ProductCarousel
          status="onsale"
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
        status="new"
        title="Explore Latest"
        products={latestProducts}
      />
      <ProductCarousel
        status="featured"
          title="Featured"
        products={featuredProducts}
      />

      <Banner banner={bannerData} title="Don't Miss Out" />

      <ProductCarousel
        status="popular"
          title="Popular"
        products={popularProducts}
      />
    </div>
  );
}
