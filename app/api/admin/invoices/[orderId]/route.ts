import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const invoice = await prisma.invoices.findFirst({
      where: { order_id: Number(orderId) }
    });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
