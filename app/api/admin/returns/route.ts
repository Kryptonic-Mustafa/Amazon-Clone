import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const returns = await prisma.sales_returns.findMany({
      include: {
        orders: {
          select: {
            customer_name: true,
            customer_email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(returns, { status: 200 });
  } catch (error) {
    console.error('Admin Fetch Returns Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, refund_amount } = body;

    const updatedReturn = await prisma.sales_returns.update({
      where: { id },
      data: { 
        status,
        refund_amount: refund_amount ? parseFloat(refund_amount) : undefined
      }
    });

    return NextResponse.json(updatedReturn, { status: 200 });
  } catch (error) {
    console.error('Admin Update Return Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
