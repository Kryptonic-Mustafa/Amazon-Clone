"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'INR' | 'KWD';

// Example Rates (Base USD) - In production, fetch these from an API
const rates = {
  USD: 1,
  INR: 83.50, // 1 USD = ~83.5 INR
  KWD: 0.31   // 1 USD = ~0.31 KWD
};

const symbols = { USD: '$', INR: '₹', KWD: 'KWD' };

const CurrencyContext = createContext<any>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('app_currency') as Currency;
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  // Function to wrap around any price in your app
  const formatPrice = (usdPrice: number) => {
    const converted = usdPrice * rates[currency];
    return `${symbols[currency]} ${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
