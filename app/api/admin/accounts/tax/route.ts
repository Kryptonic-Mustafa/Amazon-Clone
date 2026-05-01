import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  try {
    let where: any = {};
    
    // Apply Date Range
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const invoices = await prisma.invoices.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    const users = await prisma.users.findMany({ select: { id: true, name: true, email: true }});
    const orders = await prisma.orders.findMany({ select: { id: true, user_id: true }});

    // Map user_id to invoices via orders table
    let finalInvoices = invoices.map(inv => {
       const order = orders.find(o => o.id === inv.order_id);
       return { ...inv, user_id: order?.user_id || null };
    });

    if (userId && userId !== 'all') {
       finalInvoices = finalInvoices.filter(inv => inv.user_id === parseInt(userId));
    }

    return NextResponse.json({ entries: finalInvoices, users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tax data' }, { status: 500 });
  }
}
