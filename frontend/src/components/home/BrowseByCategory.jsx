import { API_URL } from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const BrowseByCategory = async ({ isLoading = false }) => {

  const { data } = await axios.get(`${API_URL}/api/categories`);
  let categories = data.categories.slice(0, 6);
  return (
    <section className="max-w-6xl mx-auto pb-16 pt-9">
      <h2 className="text-3xl font-bold mb-6">Browse by Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => {
              const spanClass =
                idx === 0 || idx === 3 ? "col-span-2 row-span-2" : "";
              return (
                <div
                  key={`skeleton-${idx}`}
                  className={`relative rounded-xl bg-gray-200 animate-pulse ${spanClass}`}
                />
              );
            })
          : categories.map((cat, idx) => {
              const spanClass =
                idx === 0 || idx === 3 ? "col-span-2 row-span-2" : "";

              return (
                <div
                  key={idx}
                  className={`relative rounded-xl overflow-hidden ${spanClass} group`}
                >
                  <Image
                    src={cat?.image?.url}
                    alt={cat.name}
                    width={100}
                    height={100}
                    className={`object-cover w-full h-full transition duration-300`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/products?category=${cat._id}`}
                      className="bg-black text-white px-6 py-2 text-lg font-semibold rounded-full shadow-lg"
                    >
                      Explore
                    </Link>
                  </div>

                  <div className="absolute bottom-3 left-3 group-hover:opacity-0 transition-opacity duration-300">
                    <span className="bg-white text-black px-4 py-1 text-sm font-medium rounded-full shadow">
                      {cat.name}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
};

export default BrowseByCategory;
