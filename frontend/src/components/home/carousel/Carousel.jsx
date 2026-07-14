// Carousel.jsx Hero
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Carousel({ items }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openDetails, setOpenDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const intervalRef = useRef(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const startAutoSlide = () => {
    if (!isLoading) {
      intervalRef.current = setInterval(goToNext, 6000);
    }
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    // Preload all images
    const imagePromises = items.map((item) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = item.img;
        img.onload = () => {
          setLoadedImages((prev) => ({
            ...prev,
            [item.id]: true,
          }));
          resolve();
        };
        img.onerror = () => resolve(); // Still resolve on error to not block loading
      });
    });

    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
    });

    return () => stopAutoSlide();
  }, [items]);

  useEffect(() => {
    if (!isLoading) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [isLoading]);

  useEffect(() => {
    setOpenDetails(false); // close when slide changes
  }, [currentIndex]);

  const currentItem = items[currentIndex];

  return (
    <div
      className="w-full h-full relative transition-all duration-300 ease-in-out mt-1"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <div className="relative w-full h-[500px] overflow-hidden group rounded-3xl inverted-radius">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-3xl animate-pulse"></div>
        ) : (
          <>
            {items.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  style={{
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "inherit",
                    color: "#fff",
                  }}
                ></div>
              );
            })}
            <Link
              href={`/product/${currentItem?.product?._id}`}
              className="absolute cursor-pointer left-10 bottom-2 transform -translate-y-1/2 bg-primary hover:bg-opacity-60 text-black px-9 py-5 rounded-full z-20 transition"
            >
              View Details
            </Link>
          </>
        )}
      </div>

      {!isLoading && (
        <>
          <button
            onClick={goToPrev}
            className="absolute right-24 -bottom-4 cursor-pointer transform -translate-y-1/2 bg-primary hover:bg-opacity-60 text-black  px-9 py-5 rounded-tl-3xl rounded-sm z-20 transition"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-1 -bottom-4 cursor-pointer transform -translate-y-1/2 bg-primary hover:bg-opacity-60 text-black  px-9 py-5 rounded-br-3xl rounded-sm z-20 transition"
          >
            <FaChevronRight />
          </button>
        </>
      )}
    </div>
  );
}
