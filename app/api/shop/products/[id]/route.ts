import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Notice the type change to Promise<{ id: string }>
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // We MUST await params in modern Next.js
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    const product = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch associated reviews safely
    let reviews: any[] = [];
    try {
      reviews = await prisma.reviews.findMany({
        where: { product_id: productId },
        orderBy: { created_at: 'desc' }
      });
    } catch (e) {
      console.log("Reviews table might not exist yet.");
    }

    // Default dummy specs if DB column is empty
    const specifications = product.specifications || {
      "Item details": "High quality authentic material.",
      "Style": "Modern / Contemporary",
      "Measurements": "Standard sizing. Refer to chart.",
      "Materials & Care": "Hand wash recommended.",
      "Features & Specs": "Durable, Lightweight, Premium finish."
    };

    return NextResponse.json({ product, reviews, specifications }, { status: 200 });
  } catch (error) {
    console.error("Product Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
