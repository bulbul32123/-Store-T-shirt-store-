import Image from "next/image";
import Link from "next/link";
import React from "react";

const categories = [
  {
    name: "Sneakers",
    image: "/cat2.jpg",
  },
  {
    name: "Pants",
    image: "/Cate_2.webp",
  },
  {
    name: "Sunglasses",
    image: "/Cate_3.webp",
  },
  {
    name: "T-shirts",
    image: "/cat1.avif",
  },
  {
    name: "Shoes",
    image: "/Cate_4.webp",
  },
  {
    name: "Bags",
    image: "/Cate_5.webp",
  },
];

const BrowseByCategory = () => {
  return (
    <section className=" max-w-6xl mx-auto pb-16 pt-9">
      <h2 className="text-3xl font-bold mb-6">Browse by Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {categories.map((cat, idx) => {
          const spanClass =
            idx === 0 || idx === 3 ? "col-span-2 row-span-2" : "";
          const isUpcoming = idx === 1 || idx === 2;

          return (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden ${spanClass} group`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className={`object-cover w-full h-full transition duration-300 ${isUpcoming
                  ? "blur-sm brightness-75"
                  : "group-hover:blur-sm group-hover:brightness-75"
                  }`}
              />


              {/* Label for Upcoming or Explore */}
              {isUpcoming ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-black text-white px-6 py-2 text-lg font-semibold rounded-full shadow-lg">
                    Upcoming
                  </span>
                </div>
              ) : (
                <>
                  {/* Show Explore on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/categories/${(cat.name).toLowerCase()}`} className="bg-black text-white px-6 py-2 text-lg font-semibold rounded-full shadow-lg">
                      Explore
                    </Link>
                  </div>

                  {/* Show category name normally */}
                  <div className="absolute bottom-3 left-3 group-hover:opacity-0 transition-opacity duration-300">
                    <span className="bg-white text-black px-4 py-1 text-sm font-medium rounded-full shadow">
                      {cat.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BrowseByCategory;
