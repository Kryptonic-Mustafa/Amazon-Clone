import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [unreadOrders]: any = await db.query('SELECT * FROM orders WHERE viewed = 0 ORDER BY created_at DESC');
    return NextResponse.json(unreadOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { orderIds } = await req.json(); 
    
    if (orderIds === 'all') {
      await db.query('UPDATE orders SET viewed = 1 WHERE viewed = 0');
    } else if (Array.isArray(orderIds) && orderIds.length > 0) {
      // Allows marking specific IDs (even just one) as read
      await db.query(`UPDATE orders SET viewed = 1 WHERE id IN (?)`, [orderIds]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}