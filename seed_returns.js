const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 10 sales returns...');
  
  // 1. Get some completed orders with items
  const completedOrders = await prisma.orders.findMany({
    where: { status: 'Completed' },
    include: { order_items: true },
    take: 10
  });

  if (completedOrders.length === 0) {
    console.log('No completed orders found. Please complete some orders first.');
    return;
  }

  const reasons = [
    'Product was damaged on arrival',
    'Received wrong item',
    'Not satisfied with quality',
    'Size did not fit',
    'Found a better price elsewhere',
    'Accidental order'
  ];

  for (let i = 0; i < 10; i++) {
    const order = completedOrders[i % completedOrders.length];
    const item = order.order_items[0];
    
    if (!item) continue;

    await prisma.sales_returns.create({
      data: {
        order_id: order.id,
        user_id: order.user_id || 1,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: 1,
        return_reason: reasons[i % reasons.length],
        status: 'Pending',
        created_at: new Date()
      }
    });
  }

  console.log('Seed complete. 10 Pending sales returns created.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
