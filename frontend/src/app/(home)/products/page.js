import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ProductsPageInner, SkeletonCard } from "@/components/products/ProductsPageInner";
import { productsApi } from "@/lib/productsApi";
import { Suspense } from "react";

const STATUS_TITLES = {
  featured: "Featured Products",
  newDrop: "New Drops & Arrivals",
  bestselling: "Best Selling Fashion",
  popular: "Most Popular Style",
};

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const { category, status, sale, freeShipping, minRating } = resolvedParams;

  let titleSnippet = "Shop All Products";

  if (category) {
    try {
      const categories = await productsApi.getCategories();
      const activeCategory = Array.isArray(categories)
        ? categories.find((c) => c._id === category)
        : null;

      if (activeCategory?.name) {
        titleSnippet = `${activeCategory.name} Collection`;
      } else {
        titleSnippet = "Category Collection";
      }
    } catch {
      titleSnippet = "Category Collection";
    }
  }
  else if (status && STATUS_TITLES[status]) {
    titleSnippet = STATUS_TITLES[status];
  } else if (sale === "true") {
    titleSnippet = "Special Offers & Sales";
  } else if (freeShipping === "true") {
    titleSnippet = "Free Shipping Items";
  } else if (minRating && Number(minRating) >= 4) {
    titleSnippet = "Top Rated Collection";
  }

  return {
    title: `${titleSnippet} | Payra Bangladesh`,
    description: `Discover premium lifestyle gear, streetwear, and sneakers in our ${titleSnippet.toLowerCase()} at Payra. Enjoy cash on delivery and fast shipping across Bangladesh.`,
    openGraph: {
      title: `${titleSnippet} - Payra`,
      description: `Explore the dynamic ${titleSnippet.toLowerCase()} catalog on Payra. Find your next fit today.`,
    },
  };
}
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
         <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                   {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
