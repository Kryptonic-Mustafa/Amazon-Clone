"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useShopFilter } from '@/context/ShopFilterContext';

const FALLBACK_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'Clothes': 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'Laptops': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'Attar': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'ArtsStudio': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';

export default function DynamicCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { setSelectedCategory } = useShopFilter();

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Display up to 8 categories to form two rows of 4
          setCategories(data.slice(0, 8));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    router.push('/shop');
  };

  if (loading) return null;

  return (
    <div className="container mx-auto px-4 relative z-20 mt-8 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <div 
            key={cat.id || i} 
            className="bg-white p-5 flex flex-col h-[400px] shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => handleCategoryClick(cat.name)}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">{cat.name}</h2>
            <div className="relative flex-grow mb-4 bg-gray-50 overflow-hidden">
              <Image 
                src={FALLBACK_IMAGES[cat.name] || DEFAULT_IMAGE} 
                alt={cat.name} 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-blue-600 group-hover:text-red-500 group-hover:underline text-sm font-medium">
              Shop {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
