import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Basic Stats
    const totalProducts = await prisma.products.count();
    const totalCustomers = await prisma.users.count();
    const totalOrders = await prisma.orders.count();
    
    const orders = await prisma.orders.findMany({ select: { total_amount: true, created_at: true, status: true }});
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    // 2. New Enterprise Module Stats
    const lowStockCount = await prisma.products.count({ where: { stock_qty: { lte: 10 } } });
    const totalQuotes = await prisma.quotations.count();
    const totalPOs = await prisma.purchase_orders.count();
    
    // 3. Reviews & Ratings
    const reviews = await prisma.reviews.findMany({ select: { rating: true } });
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : "0.0";
    const totalReviews = reviews.length;

    // 4. Chart Data (Last 7 Days Revenue)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayTotal = orders
        .filter((o: any) => new Date(o.created_at).toISOString().split('T')[0] === dateStr)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
        
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        revenue: dayTotal
      });
    }

    // 5. Recent Orders List
    const recentOrders = await prisma.orders.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, customer_name: true, total_amount: true, status: true, created_at: true }
    });

    return NextResponse.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        products: totalProducts,
        lowStock: lowStockCount,
        quotes: totalQuotes,
        pos: totalPOs,
        avgRating,
        totalReviews
      },
      chartData,
      recentOrders
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
