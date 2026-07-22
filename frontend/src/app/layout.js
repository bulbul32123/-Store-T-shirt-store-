import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { VisitPopupProvider } from "@/context/VisitPopupContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Bangladesh’s Favorite Online Store | Order Now at Payra.com",
  description:
    "Upgrade your footwear game with Payra.com. Discover Premium quality, New and  affordable shoes for your style. Shop online today, Order now!",
  icons: {
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
      <body className="h-full w-full antialiased relative overflow-x-hidden mx-auto xl:max-w-[1500px]">
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WatchlistProvider>
                <VisitPopupProvider>
                  <CompareProvider>
                    <Toaster
                      position="top-right"
                      reverseOrder={false}
                      gutter={8}
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "#ffb800", 
                          color: "#000000",
                          borderRadius: "10px",
                          padding: "16px",
                          fontSize: "14px",
                        },
                        success: {
                          duration: 3000,
                          style: {
                            background: "#22c55e",
                            color: "#ffffff", 
                            border: "1px solid #16a34a",
                          },
                          iconTheme: {
                            primary: "#ffffff",
                            secondary: "#22c55e",
                          },
                        },
                        error: {
                          duration: 5000,
                          style: {
                            background: "#ef4444", 
                            color: "#ffffff",
                            border: "1px solid #dc2626",
                          },
                          iconTheme: {
                            primary: "#ffffff",
                            secondary: "#ef4444",
                          },
                        },
                      }}
                    />
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
