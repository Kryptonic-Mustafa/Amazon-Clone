import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const notifications: any[] = [];
    
    // 1. Check Inventory Levels
    const products = await prisma.products.findMany({ 
        where: { is_active: true,  stock_qty: { lte: 20 } },
        select: { id: true, name: true, stock_qty: true }
    });

    products.forEach(p => {
        if ((p.stock_qty ?? 0) <= 5) {
            notifications.push({ 
                id: `stock_${p.id}`, 
                type: 'danger', 
                title: 'Critical Stock Alert', 
                message: `${p.name} only has ${p.stock_qty} units left! Restock immediately.`, 
                time: new Date().toISOString(),
                link: '/admin/inventory',
                category: 'inventory'
            });
        } else if ((p.stock_qty ?? 0) <= 20) {
            notifications.push({ 
                id: `stock_${p.id}`, 
                type: 'warning', 
                title: 'Low Stock Warning', 
                message: `${p.name} is running low (${p.stock_qty} units left).`, 
                time: new Date().toISOString(),
                link: '/admin/inventory',
                category: 'inventory'
            });
        }
    });

    // 2. Check Recent Pending/New Orders (Increase limit to see more)
    const recentOrders = await prisma.orders.findMany({
        take: 50,
        orderBy: { created_at: 'desc' },
        select: { id: true, customer_name: true, total_amount: true, created_at: true, status: true }
    });

    recentOrders.forEach(o => {
        notifications.push({ 
            id: `order_${o.id}`, 
            type: 'info', 
            title: 'New Order Received', 
            message: `Order #${o.id} from ${o.customer_name} for $${Number(o.total_amount).toFixed(2)}.`, 
            time: o.created_at,
            link: `/admin/orders/${o.id}`,
            category: 'order',
            orderData: { // Pass raw data for context usage
              id: o.id,
              customer_name: o.customer_name,
              total_amount: o.total_amount,
              created_at: o.created_at,
              status: o.status
            }
        });
    });

    // Sort all notifications by time (newest first)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
