import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { SettingsProvider } from "@/context/SettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import GoogleTranslate from "@/components/shop/GoogleTranslate";
import WishlistWidget from "@/components/shop/WishlistWidget"; // THE NEW WIDGET

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <GoogleTranslate />
          <Header />
          <main className="min-h-screen bg-white text-slate-900">{children}</main>
          <Footer />
          <WishlistWidget /> 
        </CurrencyProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
