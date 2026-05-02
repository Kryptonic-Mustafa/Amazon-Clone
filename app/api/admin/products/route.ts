import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.products.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Automatically generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.products.create({
      data: {
        name: data.name,
        slug: slug,
        description: data.description,
        price: String(data.price),
        discount_percent: Number(data.discount_percent) || 0,
        sale_flag: Number(data.sale_flag) || 0,
        stock_qty: Number(data.stock_qty) || 0,
        category_ids: data.category_ids,
        image_urls: data.image_urls,
        brand: data.brand,
        specifications: data.specifications || {},
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product Create Error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
