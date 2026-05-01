import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.reviews.findMany({ where: { is_active: true,  is_active: true }, orderBy: { created_at: 'desc' }
    });

    // Fetch the products associated with these reviews to get Images and Names
    const productIds = [...new Set(reviews.map((r: any) => r.product_id))];
    const products = await prisma.products.findMany({ where: { is_active: true,  id: { in: productIds } },
      select: { id: true, name: true, image_urls: true }
    });

    // Enrich the reviews array with product data
    const enrichedReviews = reviews.map((review: any) => {
      const product = products.find((p: any) => p.id === review.product_id);
      return {
        ...review,
        product_name: product?.name || 'Unknown Product',
        product_image: product?.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png'
      };
    });

    return NextResponse.json(enrichedReviews, { status: 200 });
  } catch (error) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const review = await prisma.reviews.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.reviews.update({ where: {  id  }, data: { is_active: false } });

    const allReviews = await prisma.reviews.findMany({ where: { is_active: true,  product_id: review.product_id } });
    const avgRating = allReviews.length > 0 ? (allReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / allReviews.length).toFixed(1) : "0.0";

    await prisma.products.update({
      where: { id: review.product_id },
      data: { rating: avgRating }
    });

    return NextResponse.json({ message: 'Review deleted and ratings recalculated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
