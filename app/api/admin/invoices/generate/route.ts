import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { orderId, customerName, address, amount } = await req.json();

    // 1. Check if invoice already exists
    const [existing]: any = await db.query('SELECT * FROM invoices WHERE order_id = ?', [orderId]);
    if (existing.length > 0) {
        return NextResponse.json({ error: "Invoice already exists" }, { status: 400 });
    }

    // 2. Generate Dynamic Invoice Number (INV-YYYY-XXXX)
    const year = new Date().getFullYear();
    // Count invoices created THIS year to determine the sequence
    const [countResult]: any = await db.query(
        'SELECT COUNT(*) as count FROM invoices WHERE YEAR(created_at) = ?', 
        [year]
    );
    const sequence = countResult[0].count + 1;
    const invoiceNumber = `INV-${year}-${String(sequence).padStart(4, '0')}`; // e.g., INV-2025-0001

    // 3. Calculate Tax (Assuming 18% GST included or extra, let's assume included for simplicity)
    const taxAmount = (amount * 0.18).toFixed(2); 

    // 4. Insert Invoice
    await db.query(
        'INSERT INTO invoices (invoice_number, order_id, customer_name, customer_address, total_amount, tax_amount) VALUES (?, ?, ?, ?, ?, ?)',
        [invoiceNumber, orderId, customerName, address, amount, taxAmount]
    );

    // 4.1 Update Order with Invoice Number
    await db.query('UPDATE orders SET invoice_no = ? WHERE id = ?', [invoiceNumber, orderId]);

    // 5. UPDATE LEDGER (Debit Entry - "Receivable Created")
    // Get last ledger balance
    const [lastEntry]: any = await db.query('SELECT balance FROM ledger ORDER BY id DESC LIMIT 1');
    const lastBalance = lastEntry.length > 0 ? Number(lastEntry[0].balance) : 0;
    const newBalance = lastBalance - Number(amount); // Balance decreases (money owed to us is negative/asset context depends on accounting style, usually AR is Debit +)
    // For simplicity: Debit = Money we expect (Asset). Credit = Money we get.
    // Let's stick to: Balance = Credits (Received) - Debits (Invoiced/Owed). 
    // If I invoice $100, Balance is -$100 (Owed). When paid, Balance becomes $0.
    
    await db.query(
        'INSERT INTO ledger (description, reference_id, type, debit, credit, balance) VALUES (?, ?, ?, ?, ?, ?)',
        [`Invoice generated for Order #${orderId}`, orderId, 'INVOICE', amount, 0.00, newBalance]
    );

    return NextResponse.json({ success: true, invoiceNumber });

  } catch (error: any) {
    console.error("Invoice Gen Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}