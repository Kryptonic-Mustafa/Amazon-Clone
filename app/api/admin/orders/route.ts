import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch ALL orders for the Admin Panel list
export async function GET() {
  try {
    // Selects all orders, sorted by newest first
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}