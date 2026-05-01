import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // We MUST await params in modern Next.js
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    const { user_id, user_name, user_email, rating, comment } = await req.json();

    if (!user_name || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle Guests: user_id is 0, append email to name for tracking
    const finalUserId = user_id ? parseInt(user_id) : 0;
    const finalUserName = user_id ? user_name : `${user_name} (Guest - ${user_email})`;

    const review = await prisma.reviews.create({
      data: {
        product_id: productId,
        user_id: finalUserId,
        user_name: finalUserName,
        rating: parseInt(rating),
        comment: comment
      }
    });

    // AUTO-CALCULATION ENGINE
    const allReviews = await prisma.reviews.findMany({ where: { product_id: productId } });
    const avgRating = allReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / allReviews.length;

    // Save the new calculated rating directly to the product table
    await prisma.products.update({
      where: { id: productId },
      data: { rating: avgRating.toFixed(1) }
    });

    return NextResponse.json({ message: "Review added successfully", review, newAverage: avgRating.toFixed(1) }, { status: 201 });
  } catch (error) {
    console.error("Review POST Error:", error);
    return NextResponse.json({ error: 'Failed to post review' }, { status: 500 });
  }
}
