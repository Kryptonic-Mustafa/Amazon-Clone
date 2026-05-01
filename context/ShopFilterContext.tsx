"use client";

import React, { createContext, useContext, useState } from 'react';

interface ShopFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  clearFilters: () => void;
}

const ShopFilterContext = createContext<ShopFilterContextType | undefined>(undefined);

export function ShopFilterProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Products");
    setMaxPrice(5000);
    setSelectedBrands([]);
    setSortOption("newest");
  };

  return (
    <ShopFilterContext.Provider value={{
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      maxPrice, setMaxPrice,
      selectedBrands, setSelectedBrands,
      sortOption, setSortOption,
      clearFilters
    }}>
      {children}
    </ShopFilterContext.Provider>
  );
}

export function useShopFilter() {
  const context = useContext(ShopFilterContext);
  if (context === undefined) {
    throw new Error('useShopFilter must be used within a ShopFilterProvider');
  }
  return context;
}
