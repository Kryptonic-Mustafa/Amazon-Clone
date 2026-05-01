"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext<any>(null);

const translations: any = {
  en: { home: "Home", shop: "Shop", sales: "Sales", contact: "Contact", searchPlaceholder: "Search AmazonClone", login: "Login", logout: "Logout", myProfile: "My Profile", cart: "Cart", view: "View", addToCart: "Add to Cart" },
  ar: { home: "الرئيسية", shop: "المتجر", sales: "تخفيضات", contact: "اتصل بنا", searchPlaceholder: "ابحث في أمازون كلون", login: "تسجيل الدخول", logout: "تسجيل خروج", myProfile: "ملفي الشخصي", cart: "عربة التسوق", view: "عرض", addToCart: "أضف للسلة" }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState('en');

  // Trigger the hidden Google Translate engine
  const triggerGoogleTranslate = (langCode: string) => {
    const selectField = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectField) {
        selectField.value = langCode;
        selectField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') || 'en';
    setLangState(saved);
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = saved;
    
    // Give Google Script a moment to load, then sync the language
    setTimeout(() => triggerGoogleTranslate(saved), 1000);
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    // Command Google to translate the page
    triggerGoogleTranslate(newLang);
  };

  const t = (key: string) => translations[lang]?.[key] || translations['en'][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
