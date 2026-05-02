import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("Fetching sales returns...");
    const returns = await (prisma as any).sales_returns.findMany({
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
    console.log(`Found ${returns.length} returns`);
    return NextResponse.json(returns, { status: 200 });
  } catch (error: any) {
    console.error('Admin Fetch Returns Error Detailed:', error.message || error);
    return NextResponse.json({ error: 'Server error: ' + (error.message || 'Unknown') }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, refund_amount } = body;

    // Fetch the return record first to get product_id and quantity
    const existingReturn = await (prisma as any).sales_returns.findUnique({
      where: { id }
    });

    if (!existingReturn) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    // Start a transaction to update return status and potentially inventory
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the return record
      const updatedReturn = await (tx as any).sales_returns.update({
        where: { id },
        data: { 
          status,
          refund_amount: refund_amount ? parseFloat(refund_amount) : undefined
        }
      });

      // 2. If status is changing to 'Completed', increase product stock
      if (status === 'Completed' && existingReturn.status !== 'Completed') {
        await (tx as any).products.update({
          where: { id: existingReturn.product_id },
          data: {
            stock_qty: {
              increment: existingReturn.quantity
            }
          }
        });
        
        // Optional: Create a ledger entry for the refund
        if (refund_amount) {
          await (tx as any).ledger.create({
            data: {
              description: `Refund for Sales Return #${id} (Order #${existingReturn.order_id})`,
              type: 'REFUND',
              debit: parseFloat(refund_amount),
              balance: 0, // Logic for balance calculation would go here if needed
              reference_id: id
            }
          });
        }
      }

      return updatedReturn;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Admin Update Return Error Detailed:', error.message || error);
    return NextResponse.json({ error: 'Server error: ' + (error.message || 'Unknown') }, { status: 500 });
  }
}


