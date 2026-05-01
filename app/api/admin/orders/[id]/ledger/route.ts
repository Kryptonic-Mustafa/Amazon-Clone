import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const order = await prisma.orders.findUnique({ where: { id: Number(id) } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Create a Ledger Entry for this order
    const entry = await prisma.ledger.create({
      data: {
        transaction_date: new Date(),
        description: `Revenue from Order #${order.id} - ${order.customer_name}`,
        reference_id: order.id,
        type: 'INVOICE',
        credit: order.total_amount,
        debit: 0,
        balance: order.total_amount 
      }
    });

    return NextResponse.json({ success: true, entry }, { status: 200 });
  } catch (error) {
    console.error("🚨 Ledger POST Error:", error);
    return NextResponse.json({ error: 'Failed to post to ledger' }, { status: 500 });
  }
}
