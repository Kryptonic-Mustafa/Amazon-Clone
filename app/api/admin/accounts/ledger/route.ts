import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM ledger ORDER BY transaction_date DESC');
    
    // Calculate live totals
    const totals = rows.reduce((acc: any, curr: any) => ({
      debit: acc.debit + Number(curr.debit),
      credit: acc.credit + Number(curr.credit)
    }), { debit: 0, credit: 0 });

    return NextResponse.json({ transactions: rows, totals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}