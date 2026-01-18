import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // fetch distinct brands that are not empty
    const [brands]: any = await db.query(
      'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != "" ORDER BY brand ASC'
    );
    
    // Convert [{brand: 'Apple'}, {brand: 'Nike'}] -> ['Apple', 'Nike']
    const brandList = brands.map((b: any) => b.brand);
    
    return NextResponse.json(brandList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}