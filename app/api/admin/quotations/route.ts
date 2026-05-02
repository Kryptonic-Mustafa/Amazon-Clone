import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const quotes = await prisma.quotations.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } });
    return NextResponse.json(quotes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const quote = await prisma.quotations.create({
      data: {
        customer_name: data.customer_name,
        email: data.email || null,
        total_amount: data.total_amount,
        status: "Pending",
        items: data.items // JSON array of items
      }
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    await prisma.quotations.update({ where: {  id  }, data: { is_active: false } });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
