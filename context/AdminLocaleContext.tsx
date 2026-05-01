"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Expanded Translation Dictionary
const translations: Record<string, Record<string, string>> = {
  ar: {
    "Dashboard": "لوحة القيادة",
    "Inventory": "المخزون",
    "Products": "المنتجات",
    "Orders": "الطلبات",
    "Invoices": "الفواتير",
    "Quotations": "عروض الأسعار",
    "Purchase Orders": "طلبات الشراء",
    "Customers": "العملاء",
    "Reviews": "التقييمات",
    "Settings": "الإعدادات",
    "Main Menu": "القائمة الرئيسية",
    "Accounts & System": "الحسابات والنظام",
    "Sign Out": "تسجيل الخروج",
    "Order Management": "إدارة الطلبات",
    "Customer Management": "إدارة العملاء",
    "Add New Customer": "إضافة عميل جديد",
    "Order ID": "رقم الطلب",
    "Customer": "العميل",
    "Customer Name": "اسم العميل",
    "Amount": "المبلغ",
    "Date": "التاريخ",
    "Status": "الحالة",
    "Action": "إجراء",
    "Actions": "إجراءات",
    "Email": "البريد الإلكتروني",
    "Phone": "رقم الهاتف",
    "Joined": "تاريخ الانضمام",
    "Product": "المنتج",
    "Brand": "العلامة التجارية",
    "Price": "السعر",
    "Stock Level": "مستوى المخزون",
    "Pending": "قيد الانتظار",
    "Completed": "مكتمل",
    "Cancelled": "ملغى",
    "Critical": "حرج",
    "Low": "منخفض",
    "In Stock": "متوفر",
    "Platform Overview": "نظرة عامة على المنصة",
    "Real-time metrics for your enterprise modules.": "مقاييس في الوقت الفعلي لوحدات مؤسستك.",
    "Total Revenue": "إجمالي الإيرادات",
    "Total Orders": "إجمالي الطلبات",
    "Avg Rating": "متوسط التقييم",
    "Module Activity": "نشاط الوحدة",
    "Low Stock Items": "عناصر منخفضة المخزون",
    "Total Quotations": "إجمالي عروض الأسعار",
    "Items": "عناصر",
    "Issued": "مُصدر",
    "Created": "تم الإنشاء",
    "Revenue (Last 7 Days)": "الإيرادات (آخر 7 أيام)",
    "Recent Orders": "الطلبات الأخيرة",
    "Products Management": "إدارة المنتجات",
    "Manage Brands": "إدارة العلامات التجارية",
    "Manage Categories": "إدارة الفئات",
    "Add Product": "إضافة منتج",
    "All time": "كل الوقت",
    "Based on": "بناء على",
    "reviews": "مراجعات",
    "Stock": "المخزون",
    "Invoice": "فاتورة",
    "Billed To": "فاتورة إلى",
    "Shipping Address": "عنوان الشحن",
    "Invoice Date": "تاريخ الفاتورة",
    "Payment Status": "حالة الدفع",
    "Item Description": "وصف العنصر",
    "Qty": "الكمية",
    "Total": "الإجمالي",
    "Subtotal": "المجموع الفرعي",
    "Tax": "الضريبة",
    "Shipped": "تم الشحن",
    "Print Invoice": "طباعة الفاتورة",
    "Back to Orders": "العودة إلى الطلبات",
    "Ledger": "الأستاذ العام",
    "Generate Invoice": "إنشاء فاتورة",
    "Invoice Management": "إدارة الفواتير",
    "Invoice #": "رقم الفاتورة #",
    "No invoices found.": "لم يتم العثور على فواتير.",
    "Generate Invoice?": "إنشاء فاتورة؟",
    "Record in Ledger?": "التسجيل في الأستاذ؟",
    "Yes, record it!": "نعم، سجلها!",
    "Invoice generated successfully!": "تم إنشاء الفاتورة بنجاح!",
    "Recorded in Ledger successfully!": "تم التسجيل في الأستاذ بنجاح!",
    "General Ledger": "الأستاذ العام",
    "Statement of Accounts": "كشف الحسابات",
    "All Accounts (General)": "جميع الحسابات (عام)",
    "Export CSV": "تصدير CSV",
    "Print Report": "طباعة التقرير",
    "Account / User": "الحساب / المستخدم",
    "Period From": "الفترة من",
    "Period To": "الفترة إلى",
    "All": "الكل",
    "Generating...": "جاري الإنشاء...",
    "GSTIN": "رقم التسجيل الضريبي",
    "PAN": "رقم الحساب الدائم",
    "Tax Invoice": "فاتورة ضريبية",
    "Order Reference": "مرجع الطلب",
    "Payment Mode": "طريقة الدفع",
    "Cash/Online": "نقدي/عبر الإنترنت",
    "Cashier": "الكاشير",
    "Customer Details": "تفاصيل العميل",
    "S.No": "م.",
    "Rate": "السعر",
    "No items available for this draft.": "لا توجد عناصر متاحة لهذه المسودة.",
    "Amount in Words": "المبلغ بالحروف",
    "Total payable amount in currency units.": "إجمالي المبلغ المستحق بالعملة.",
    "Sub Total": "المجموع الفرعي",
    "GST": "ضريبة القيمة المضافة",
    "Grand Total": "الإجمالي الكلي",
    "Prices are inclusive of all taxes": "الأسعار شاملة لجميع الضرائب",
    "Terms & Conditions": "الشروط والأحكام",
    "Goods once sold will not be taken back or exchanged.": "البضائع المباعة لا ترد ولا تستبدل.",
    "Warranty as per manufacturer terms and conditions.": "الضمان حسب شروط وأحكام الشركة المصنعة.",
    "Subject to local jurisdiction of the store city.": "يخضع للاختصاص المحلي لمدينة المتجر.",
    "This is a computer generated invoice.": "هذه فاتورة تم إنشاؤها بواسطة الكمبيوتر.",
    "Authorized Signatory": "المفوض بالتوقيع"
  }
};

type LocaleContextType = {
  locale: string;
  currency: string;
  isRTL: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number | string) => string;
  formatNumber: (amount: number | string, decimals?: number) => string;
  setLocale: (loc: string) => void;
  setCurrency: (cur: string) => void;
};

const AdminLocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const AdminLocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState('en-IN');
  const [currency, setCurrencyState] = useState('INR');

  useEffect(() => {
    const savedLoc = localStorage.getItem('admin_locale') || 'en-IN';
    const savedCur = localStorage.getItem('admin_currency') || 'INR';
    setLocaleState(savedLoc);
    setCurrencyState(savedCur);
  }, []);

  const setLocale = (loc: string) => {
    setLocaleState(loc);
    localStorage.setItem('admin_locale', loc);
  };

  const setCurrency = (cur: string) => {
    setCurrencyState(cur);
    localStorage.setItem('admin_currency', cur);
  };

  const isRTL = locale === 'ar-KW' || locale.startsWith('ar');

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [isRTL, locale]);

  const t = (key: string) => {
    const lang = locale.split('-')[0];
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    return key; 
  };

  // FIX: Force Western Numerals (0-9) even in Arabic locales by appending '-u-nu-latn'
  const getFormatLocale = () => {
    return isRTL ? `${locale}-u-nu-latn` : locale;
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat(getFormatLocale(), { style: 'currency', currency: currency }).format(Number(amount));
  };

  const formatNumber = (amount: number | string, decimals: number = 0) => {
    return new Intl.NumberFormat(getFormatLocale(), { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }).format(Number(amount));
  };

  return (
    <AdminLocaleContext.Provider value={{ locale, currency, isRTL, t, formatCurrency, formatNumber, setLocale, setCurrency }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </AdminLocaleContext.Provider>
  );
};

export const useAdminLocale = () => {
  const context = useContext(AdminLocaleContext);
  if (!context) throw new Error("Must be used within AdminLocaleProvider");
  return context;
};
