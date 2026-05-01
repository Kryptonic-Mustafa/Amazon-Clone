"use client";

import { useEffect, useState } from 'react';
import ProductSlider from './ProductSlider';

export default function RecentlyViewed() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('recently_viewed_items');
    if (saved) {
      try {
        const productIds = JSON.parse(saved);
        if (Array.isArray(productIds) && productIds.length > 0) {
          // Ideally fetch specific products by ID from backend, 
          // but since there's no bulk ID fetch endpoint right now, we fetch all and filter.
          fetch('/api/shop/products')
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                // Filter and sort according to the saved order
                const recentlyViewedProducts = productIds
                  .map(id => data.find(p => p.id === id))
                  .filter(Boolean);
                setProducts(recentlyViewedProducts);
              }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (!loading && products.length === 0) {
    return null; // Don't show anything if no recent items
  }

  return (
    <div className="mt-12">
      <ProductSlider 
        title="Recently Viewed" 
        products={products} 
        loading={loading} 
      />
    </div>
  );
}
