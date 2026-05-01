"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image_urls?: string; 
  image?: string;     
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  
  // New "Buy Now" specific logic
  buyNowItem: CartItem | null; 
  setBuyNowItem: (item: CartItem | null) => void;

  totalPrice: number; 
  cartTotal: number;
  totalItems: number; 
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // NEW: State to hold a single item for "Buy Now" checkout
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // Load Cart from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
    }
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('shopping-cart', JSON.stringify(cart));
    }
  }, [cart]);

  // --- Actions ---

  const addToCart = (product: any) => {
    // If user adds to cart, we ensure we aren't in "Buy Now" mode anymore
    setBuyNowItem(null); 

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const quantityToAdd = product.quantity && product.quantity > 0 ? product.quantity : 1;

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      } else {
        return [...prevCart, { 
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || (product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png'),
          image_urls: product.image_urls,
          quantity: quantityToAdd 
        }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.success("Removed from cart");
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prevCart) => 
      prevCart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- Calculations ---
  const totalPrice = cart.reduce((total, item) => {
    return total + (Number(item.price) * (item.quantity || 1));
  }, 0);

  const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      
      // Export New Buy Now Props
      buyNowItem,
      setBuyNowItem,

      totalPrice, 
      totalItems,
      cartTotal: totalPrice,
      cartCount: totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};