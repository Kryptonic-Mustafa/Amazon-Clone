import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const orderId = url.searchParams.get('orderId');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  try {
    let where: any = {};
    
    if (orderId && orderId !== 'all') {
      where.reference_id = parseInt(orderId);
    }
    
    // Apply Date Range
    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) where.transaction_date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.transaction_date.lte = end;
      }
    }

    const entries = await prisma.ledger.findMany({
      where,
      orderBy: { transaction_date: 'asc' }
    });

    // We fetch users for the dropdown
    const users = await prisma.users.findMany({ select: { id: true, name: true, email: true }});

    // If filtering by user, we trace it through orders if ledger lacks user_id directly
    let finalEntries = entries;
    if (userId && userId !== 'all') {
      const userOrders = await prisma.orders.findMany({ where: { is_active: true,  user_id: parseInt(userId) }, select: { id: true } });
      const orderIds = userOrders.map((o: any) => o.id);
      finalEntries = entries.filter((e: any) => e.type === 'INVOICE' && orderIds.includes(e.reference_id));
    }

    return NextResponse.json({ entries: finalEntries, users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
