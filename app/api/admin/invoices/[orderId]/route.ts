import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const [rows]: any = await db.query('SELECT * FROM invoices WHERE order_id = ?', [orderId]);
    
    if (rows.length === 0) return NextResponse.json(null); // No invoice found
    return NextResponse.json(rows[0]);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}