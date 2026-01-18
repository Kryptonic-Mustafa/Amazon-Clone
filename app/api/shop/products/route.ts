// app/api/shop/products/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Correct Import
import { parseIds } from '@/lib/utils'; // Ensure this file exists, or remove if not needed

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract Filters
    const categoryId = searchParams.get('category');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 100000;
    const brand = searchParams.get('brand');
    
    // 1. Fetch RAW Products (Using 'db' instead of 'pool')
    const [rows]: any = await db.query('SELECT * FROM products WHERE stock_qty >= 0');

    // 2. Application-Level Filtering
    let filteredProducts = rows.filter((product: any) => {
      // Price Filter
      const price = Number(product.price);
      if (price < minPrice || price > maxPrice) return false;

      // Brand Filter (Exact Match)
      if (brand && product.brand?.toLowerCase() !== brand.toLowerCase()) return false;

      // CSV Category Filter
      if (categoryId) {
        // If you don't have parseIds yet, we can use a simple split
        // const productCatIds = parseIds(product.category_ids); 
        const productCatIds = product.category_ids 
          ? product.category_ids.toString().split(',').map((id: string) => parseInt(id.trim()))
          : [];

        const targetCatId = parseInt(categoryId);
        
        if (!productCatIds.includes(targetCatId)) return false;
      }

      return true;
    });

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Product Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}