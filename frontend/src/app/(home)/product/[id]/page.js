// app/product/[id]/page.js

import ProductDetailClient from "@/components/productDetail/ProductDetailClient";
import axios from "axios";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const { data: product } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
    );

    if (!product) {
      return { title: "Product Not Found | Payra" };
    }
    let categoryText = "Clothing";
    if (
      product.category &&
      typeof product.category === "object" &&
      product.category.name
    ) {
      categoryText = product.category.name;
    }

    const priceText = product.discount
      ? (product.price - (product.price * product.discount) / 100).toFixed(2)
      : product.price.toFixed(2);

    const ogImage =
      product.colors?.[0]?.images?.[0]?.url ||
      product.images?.[0]?.url ||
      "/images/placeholder.jpg";

    return {
      title: `${product.name} - ${categoryText} | Payra Bangladesh`,
      description: product.description
        ? `${product.description.slice(0, 155)}... Buy for $${priceText} at Payra.`
        : `Buy ${product.name} online at Payra Bangladesh. Enjoy fast nationwide shipping and easy checkouts.`,
      openGraph: {
        title: `${product.name} | Payra`,
        description: product.description || `Buy ${product.name} on Payra`,
        images: [{ url: ogImage }],
      },
    };
  } catch (error) {
    console.error("Metadata fetch failed:", error);
    return {
      title: "View Product | Payra Bangladesh",
      description:
        "Shop premium lifestyle apparel, accessories, and shoes at Payra.",
    };
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
