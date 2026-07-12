import axios from "axios";

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
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
  );

  const products = data.products || [];

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
      {" "}
      <Carousel items={carousel} />
      {onSaleProducts.length > 0 && (
        <ProductCarousel
          status="onsale"
          title="On Sale Now"
          products={onSaleProducts}
        />
      )}
      <BrowseByCategory />
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
      <Banner banner={bannerData} title="Don’t Miss" />
      <ProductCarousel
        status="popular"
        title="Popular"
        products={popularProducts}
      />
    </div>
  );
}
