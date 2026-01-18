import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Get Settings
    const [settings]: any = await db.query('SELECT * FROM tax_settings');
    
    // 2. Calculate EXACT Tax collected from Invoices table
    // (We look at generated invoices only, which is accurate accounting)
    const [taxResult]: any = await db.query(`
        SELECT 
            SUM(tax_amount) as total_tax,
            COUNT(*) as invoice_count
        FROM invoices
    `);
    
    const totalTaxCollected = taxResult[0].total_tax || 0;
    const invoiceCount = taxResult[0].invoice_count || 0;

    return NextResponse.json({ 
        settings, 
        totalTaxCollected, 
        orderCount: invoiceCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}