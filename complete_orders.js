const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Completing 10 orders for return testing...');
  const orders = await prisma.orders.findMany({
    take: 10,
    orderBy: { created_at: 'desc' }
  });

  for (const order of orders) {
    await prisma.orders.update({
      where: { id: order.id },
      data: { status: 'Completed' }
    });
  }
  console.log('Done. 10 orders marked as Completed.');
}

main().finally(() => prisma.$disconnect());
