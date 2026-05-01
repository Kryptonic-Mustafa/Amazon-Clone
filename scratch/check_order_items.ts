import { prisma } from '../lib/prisma';

async function checkOrder() {
  const order = await prisma.orders.findFirst({
    include: {
      order_items: true
    }
  });
  console.log('Order:', JSON.stringify(order, null, 2));
}

checkOrder().catch(console.error);
