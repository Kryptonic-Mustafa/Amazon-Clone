import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ShopFilterProvider } from "@/context/ShopFilterContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon Clone",
  description: "Full stack e-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader color="#eab308" height={3} showSpinner={false} />
        {/* WRAP EVERYTHING HERE */}
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ShopFilterProvider>
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} containerStyle={{ zIndex: 99999 }} />
                {children}
              </ShopFilterProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}