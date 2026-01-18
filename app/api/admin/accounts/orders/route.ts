import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Check if database connection works
    if (!db) {
        throw new Error("Database connection not found");
    }

    // 2. Log that we are starting the query
    console.log("Fetching orders from database...");

    // 3. Execute Query
    const [rows]: any = await db.query(`
        SELECT id, created_at, status, total_amount, payment_status 
        FROM orders 
        ORDER BY created_at DESC
    `);

    console.log(`Found ${rows.length} orders`);

    // 4. Return structured data
    return NextResponse.json({ orders: rows });

  } catch (error: any) {
    console.error("API Error fetching orders:", error);
    // Return an empty array on error so frontend doesn't crash, but send error msg
    return NextResponse.json(
        { orders: [], error: error.message }, 
        { status: 500 }
    );
  }
}