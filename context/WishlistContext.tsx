"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('amazon_clone_wishlist');
    if (saved) {
      try { setWishlist(JSON.parse(saved)); } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('amazon_clone_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const toggleWishlist = (product: any) => {
    const exists = wishlist.find(item => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      toast.success("Removed from Favorites");
    } else {
      // Clean up the object before saving to avoid massive local storage
      const minimalProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_urls: product.image_urls,
        brand: product.brand || product.category_name
      };
      setWishlist([...wishlist, minimalProduct]);
      toast.success("Added to Favorites ❤️");
    }
  };

  const isInWishlist = (id: number) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
