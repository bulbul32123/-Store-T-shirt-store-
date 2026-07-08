import './globals.css'
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WatchlistProvider } from '@/context/WatchlistContext';
import { CompareProvider } from '@/context/CompareContext';
import { Toaster } from "react-hot-toast";
import AppLayer from '@/components/layout/AppLayer';
import { NotificationProvider } from '@/context/NotificationContext';


export const metadata = {
  title: "T-Shirt Store | Quality T-Shirts for Everyone",
  description: "Find the perfect t-shirt for any occasion. Wide range of designs, colors, and sizes.",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={'h-full w-full'}>
        <AuthProvider>
        <NotificationProvider>
        <CartProvider>
        <WatchlistProvider>
        <CompareProvider>
            <Toaster position="top-center" />
              <AppLayer>
                {children}
              </AppLayer>
        </CompareProvider>
        </WatchlistProvider>
        </CartProvider>
        </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
