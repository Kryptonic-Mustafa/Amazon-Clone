const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

async function main() {
  console.log('Seeding 10 test products...');
  const newProducts = [];
  for (let i = 1; i <= 10; i++) {
    const name = `Test Product ${Date.now()}-${i}`;
    newProducts.push({
      name,
      slug: slug(name),
      description: 'This is a test product for notification testing.',
      price: (Math.random() * 500 + 50).toFixed(2),
      discount_percent: rand(0, 20),
      sale_flag: Math.random() > 0.7 ? 1 : 0,
      stock_qty: rand(10, 100),
      brand: pick(['Apple', 'Samsung', 'Nike', 'Sony', 'Adidas']),
      rating: (Math.random() * 2 + 3).toFixed(1),
      is_active: true,
    });
  }
  await prisma.products.createMany({ data: newProducts });

  console.log('Seeding 10 test orders...');
  const allUsers = await prisma.users.findMany({ take: 20 });
  const allProds = await prisma.products.findMany({ take: 20, orderBy: { id: 'desc' } });

  for (let i = 0; i < 10; i++) {
    const user = pick(allUsers) || { name: 'Guest User', email: 'guest@example.com', phone: '123456789', address: 'Test St' };
    const prod = pick(allProds);
    const qty = rand(1, 3);
    const total = (Number(prod.price) * qty).toFixed(2);

    const order = await prisma.orders.create({
      data: {
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone || '0000000000',
        user_id: user.id || null,
        total_amount: total,
        status: 'Pending',
        payment_status: 'pending',
        invoice_no: `TEST-INV-${Date.now()}-${i}`,
        shipping_address: user.address || '123 Test Street',
        viewed: false, // Make sure they show up as unread
      }
    });

    await prisma.order_items.create({
      data: {
        order_id: order.id,
        product_id: prod.id,
        product_name: prod.name,
        quantity: qty,
        price: prod.price,
      }
    });
  }

  console.log('Seed complete. 10 products and 10 "Pending" orders created.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
