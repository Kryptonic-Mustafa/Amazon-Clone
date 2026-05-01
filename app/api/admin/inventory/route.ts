import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const { id, stock_qty, price } = await req.json();
    const product = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        stock_qty: Number(stock_qty),
        price: String(price)
      }
    });
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
