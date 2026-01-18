import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch Single Order Details with Items
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ params
) {
  try {
    const { id } = await params;

    // 1. Fetch Order Info
    const [orders]: any = await db.query(
      'SELECT * FROM orders WHERE id = ?', 
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // 2. Fetch Order Items (Join with products to get images if needed)
    // We select product_name, quantity, price, and potentially image_urls from products table
    const [items]: any = await db.query(
      `SELECT oi.*, p.image_urls 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    return NextResponse.json({ order, items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update Order Status
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}