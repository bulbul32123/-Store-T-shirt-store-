import ClientLoginPage from "@/components/auth/ClientLoginPage";

export const metadata = {
  title: "Login | Payra | Bangladesh’s Favorite Online Clothing & Lifestyle Store",
  description:
    "Login to your account and shop the latest streetwear and performance gear at Payra. Discover high-quality t-shirts, shirts, premium sneakers, sunglasses, and bags with fast delivery across Bangladesh.",
  openGraph: {
    title: "Login | Payra | Premium Clothing & Streetwear Hub in Bangladesh",
    description:
      "Upgrade your wardrobe with our latest drops. Fast shipping, secure bkash/Rocket payments, and cash on delivery.",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Payra Online Store",
      },
    ],
  },
};

export default function Login() {
  return <ClientLoginPage />;
}
