'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCard from './ProductCard';

export default function ProductCarousel({
  status,
  title,
  products = [],
  showArrows = true,
}) {
  const scrollRef = useRef(null);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = () => {
    const el = scrollRef.current;

    if (!el) return;

    setIsAtStart(el.scrollLeft <= 0);
    setIsAtEnd(
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
    );
  };

  const scroll = (direction) => {
    const el = scrollRef.current;

    if (!el) return;

    el.scrollBy({
      left:
        direction === 'left'
          ? -el.clientWidth
          : el.clientWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    checkScrollPosition();

    el.addEventListener('scroll', checkScrollPosition);

    return () => {
      el.removeEventListener(
        'scroll',
        checkScrollPosition
      );
    };
  }, []);

  return (
    <section className="w-full mb-5 py-8 border-b border-border">
      <div className="flex items-start justify-between mb-4">
        {title && (
          <h2
            className={`text-3xl md:text-4xl font-extrabold ${
              status === 'onsale'
                ? 'text-red-500'
                : ''
            }`}
          >
            {title}
          </h2>
        )}

        {showArrows && products.length >= 5 && (
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => scroll('left')}
              disabled={isAtStart}
              className={`w-12 h-12 rounded-full bg-black flex items-center justify-center ${
                isAtStart
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <FaChevronLeft className="text-white" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={isAtEnd}
              className={`w-12 h-12 rounded-full bg-black flex items-center justify-center ${
                isAtEnd
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <FaChevronRight className="text-white" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto whitespace-nowrap scroll-smooth hide-scrollbar"
      >
        {products?.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            status={status}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link
          href="/products"
          className="px-6 py-2 rounded-full border border-border text-sm hover:bg-muted transition"
        >
          View All
        </Link>
      </div>
    </section>
  );
}