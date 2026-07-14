// src/app/layout.js
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { VisitPopupProvider } from "@/context/VisitPopupContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Bangladesh’s Favorite Online Store | Order Now at Payra.com",
  description: "Upgrade your footwear game with Payra.com. Discover Premium quality, New and  affordable shoes for your style. Shop online today, Order now!",
  icons: {
    // icon: "/favicon.svg",
    icon: [
      { url: "/favico-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  description:
    "Find the perfect t-shirt for any occasion. Wide range of designs, colors, and sizes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full antialiased">
        
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WatchlistProvider>
                <VisitPopupProvider>
                  <CompareProvider>
                    <Toaster position="top-center" />
                    {children}
                  </CompareProvider>
                </VisitPopupProvider>
              </WatchlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
