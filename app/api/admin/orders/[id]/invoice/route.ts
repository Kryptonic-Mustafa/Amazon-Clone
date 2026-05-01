import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const order = await prisma.orders.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Check if an invoice already exists to prevent duplicates
    const existing = await prisma.invoices.findFirst({ where: { order_id: id } });
    if (existing) return NextResponse.json(existing, { status: 200 });

    // Generate Official Invoice Number (e.g., INV-2026-0005)
    const count = await prisma.invoices.count();
    const invNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Create the invoice in the database
    const newInvoice = await prisma.invoices.create({
      data: {
        invoice_number: invNumber,
        order_id: id,
        customer_name: order.customer_name || 'Walk-in Customer',
        customer_address: order.shipping_address || 'Address not provided',
        total_amount: order.total_amount,
        tax_amount: (Number(order.total_amount) * 0.18).toFixed(2), // Standard mock 18% tax
      }
    });

    // Link the invoice number back to the order
    await prisma.orders.update({
      where: { id },
      data: { invoice_no: invNumber }
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("🚨 Invoice Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
