import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const data = await req.json();
    
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.products.update({
      where: { id },
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

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Product Update Error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await prisma.products.update({ where: {  id  }, data: { is_active: false } });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
