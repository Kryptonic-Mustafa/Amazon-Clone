import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.products.findMany({
    take: 5,
    select: { id: true, name: true, is_active: true }
  });
  console.log('Products:', JSON.stringify(products, null, 2));

  const users = await prisma.users.findMany({
    take: 5,
    select: { id: true, name: true, is_active: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
