import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Fetch the Order
    const order = await prisma.orders.findUnique({
      where: { id: Number(id) },
    });
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Safely fetch items if they exist
    let items = [];
    try {
        items = await prisma.order_items.findMany({ where: { order_id: Number(id) } });
    } catch(e) {}

    // Fetch the Invoice (if it has been generated)
    const invoice = await prisma.invoices.findFirst({
        where: { order_id: Number(id) }
    });

    // Return the order, embedding the items and invoice
    return NextResponse.json({ ...order, items, invoice: invoice || null }, { status: 200 });
  } catch (error) {
    console.error("🚨 Order GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { status } = await req.json();

    const updatedOrder = await prisma.orders.update({
      where: { id: Number(id) },
      data: { status }
    });
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("🚨 Order PUT Error:", error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
