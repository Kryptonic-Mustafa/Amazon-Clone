import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total Revenue (sum of all orders not cancelled)
    const [revenueRes]: any = await db.query(
      'SELECT SUM(total_amount) as total FROM orders WHERE status != "Cancelled"'
    );
    const totalRevenue = revenueRes[0].total || 0;

    // 2. Total Orders
    const [ordersRes]: any = await db.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = ordersRes[0].count || 0;

    // 3. Total Customers (unique emails)
    const [customersRes]: any = await db.query('SELECT COUNT(DISTINCT customer_email) as count FROM orders');
    const totalCustomers = customersRes[0].count || 0;

    // 4. Recent Orders (Last 5)
    const [recentOrders]: any = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    // 5. CHART DATA: Sales for last 7 days
    const [dailySales]: any = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%a') as name, 
        SUM(total_amount) as sales 
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%a') 
      ORDER BY DATE(created_at) ASC
    `);

    // If no sales in last 7 days, provide empty array or partial data
    // (The frontend will handle mapping this)

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      recentOrders,
      salesChart: dailySales // Send this to frontend
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}