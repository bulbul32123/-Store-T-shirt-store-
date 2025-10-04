import './globals.css'
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import AppLayer from '@/components/layout/AppLayer';


export const metadata = {
  title: "T-Shirt Store | Quality T-Shirts for Everyone",
  description: "Find the perfect t-shirt for any occasion. Wide range of designs, colors, and sizes.",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={''}>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" />
            <div className="flex flex-col min-h-screen">
              <AppLayer>
                {children}
              </AppLayer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
