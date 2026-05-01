import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pos = await prisma.purchase_orders.findMany({ where: { is_active: true,  is_active: true }, orderBy: { created_at: 'desc' } });
    return NextResponse.json(pos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const po = await prisma.purchase_orders.create({
      data: {
        supplier_name: data.supplier_name,
        total_amount: data.total_amount,
        status: "Draft",
        items: data.items
      }
    });
    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    await prisma.purchase_orders.update({ where: {  id  }, data: { is_active: false } });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
