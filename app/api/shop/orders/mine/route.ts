import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('shop_token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded: any = jwt.verify(token.value, JWT_SECRET);

    // Fetch Orders
    const [orders]: any = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
      [decoded.id]
    );

    // Fetch Items for each order
    for (const order of orders) {
      const [items]: any = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?', 
        [order.id]
      );
      order.items = items;
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}