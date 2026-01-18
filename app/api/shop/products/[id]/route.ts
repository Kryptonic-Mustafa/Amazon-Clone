import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the specific product
    const [products]: any = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = products[0];

    // Fetch suggested products (random 4 excluding current)
    const [suggestions]: any = await db.query(
      'SELECT * FROM products WHERE id != ? ORDER BY RAND() LIMIT 4', 
      [id]
    );

    return NextResponse.json({ product, suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}