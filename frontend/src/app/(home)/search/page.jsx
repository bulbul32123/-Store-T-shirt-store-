import ProductCard from "@/components/home/carousel/productCarousel/ProductCard";
import axios from "axios";


export async function generateMetadata({ searchParams }){
  const params = await searchParams;
  const query = params.query?.trim() || "";

  // Capitalize the first letter of the query for a cleaner tab title
  const formattedQuery = query 
    ? `"${query.charAt(0).toUpperCase() + query.slice(1)}"` 
    : "";

  const titleSnippet = formattedQuery 
    ? `Search Results for ${formattedQuery}` 
    : "Search Products";

  return {
    title: `${titleSnippet} | Payra Bangladesh`,
    description: query 
      ? `Looking for ${query}? Explore matching clothing, streetwear, and sneakers available at Payra with fast nationwide shipping.`
      : "Search for premium t-shirts, sneakers, sunglasses, and bags on Payra Bangladesh.",
    openGraph: {
      title: `${titleSnippet} - Payra`,
      description: query 
        ? `Find the best deals on ${query} and more items at Payra.` 
        : "Search the Payra collection.",
    },
    // Prevents search engines from indexing empty or infinite custom query combinations
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = (params.query || "").trim().toLowerCase();

  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  );

  const products = data.products || [];

  const filteredProducts = query
    ? products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.name?.toLowerCase() || "";

        return (
          name.includes(query) ||
          category.includes(query)
        );
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold">Search Results</h1>

        {query && (
          <p className="mt-2 text-gray-500">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 && "s"} found for{" "}
            <span className="font-semibold text-black">"{query}"</span>
          </p>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              status={product.newDrop ? "new" : ""}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold">No Products Found</h2>
          <p className="mt-2 text-gray-500">
            Try searching with another keyword.
          </p>
        </div>
      )}
    </div>
  );
}