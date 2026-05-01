import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoices.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Invoices Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
