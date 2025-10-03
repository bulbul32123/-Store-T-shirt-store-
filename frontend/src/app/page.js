import Link from 'next/link';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrendingProducts from '@/components/home/TrendingProducts';
import PopularProducts from '@/components/home/PopularProducts';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import Newsletter from '@/components/common/Newsletter';

export const metadata = {
  title: 'T-Shirt Store | Home',
  description: 'Find the perfect t-shirt for any occasion',
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <Categories />

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products?featured=true" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
            <Link href="/products?trending=true" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <TrendingProducts />
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Most Popular</h2>
            <Link href="/products?popular=true" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <PopularProducts />
        </div>
      </section>

      {/* Custom T-Shirt Banner */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">Design Your Own T-Shirt</h2>
              <p className="text-xl mb-6">
                Express yourself with a custom design. Our easy-to-use tool lets you create the perfect t-shirt.
              </p>
              <Link href="/customize" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300">
                Start Designing
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/custom-tshirt.jpg"
                alt="Custom T-Shirt Design"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
