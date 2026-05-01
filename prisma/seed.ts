const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production seeding on TiDB...");

  // 1. Seed Admin User
  const existingAdmin = await prisma.admin_users.findFirst({ where: { email: 'admin@example.com' } });
  if (!existingAdmin) {
    await prisma.admin_users.create({
      data: {
        full_name: 'Super Admin',
        username: 'admin',
        email: 'admin@example.com',
        password: '123456', 
        is_sa: true,
      },
    });
    console.log("✅ Admin user created.");
  } else {
    console.log("🟡 Admin user already exists, skipping.");
  }

  // 2. Seed Brands
  const brands = ['Apple', 'Samsung', 'Nike', 'Sony', 'Saif Al Burhan', 'Arts Studio', 'Adoni'];
  for (const name of brands) {
    const exists = await prisma.brands.findFirst({ where: { name } });
    if (!exists) {
      await prisma.brands.create({ data: { name } });
    }
  }
  console.log("✅ Brands synchronized.");

  // 3. Seed Categories
  const categories = [
    { name: 'Electronics', parent_id: 0 },
    { name: 'Fashion', parent_id: 0 },
    { name: 'Attar', parent_id: 0 },
    { name: 'ArtsStudio', parent_id: 0 },
  ];
  for (const cat of categories) {
    const exists = await prisma.categories.findFirst({ where: { name: cat.name } });
    if (!exists) {
      await prisma.categories.create({ data: cat });
    }
  }
  console.log("✅ Categories synchronized.");

  // 4. Seed Products
  const products = [
    {
      name: "MacBook Pro M2",
      slug: "macbook-pro-m2",
      description: "Powerhouse laptop.",
      price: "1200",
      stock_qty: 36,
      brand: "Apple",
      rating: "4.8",
      sale_flag: 1,
      discount_percent: 10,
    },
    {
      name: "Oud Musk Zaffran",
      slug: "oud-musk-zaffran",
      description: "Oud indulged with Musk and essence of Zaffran.",
      price: "125",
      stock_qty: 100,
      brand: "Saif Al Burhan",
      rating: "4.5",
      sale_flag: 1,
      discount_percent: 5,
    }
  ];
  for (const prod of products) {
    const exists = await prisma.products.findFirst({ where: { slug: prod.slug } });
    if (!exists) {
      await prisma.products.create({ data: prod });
    }
  }
  console.log("✅ Initial products synchronized.");

  // 5. Seed Tax Settings
  const taxExists = await prisma.tax_settings.findFirst({ where: { id: 1 } });
  if (!taxExists) {
    await prisma.tax_settings.create({
      data: {
        id: 1,
        tax_name: 'GST',
        rate_percent: '18',
        is_active: true,
      },
    });
    console.log("✅ Tax settings created.");
  }

  console.log("\n🎉 TiDB Seeding Successful!");
}

main()
  .catch((e) => {
    console.error("🚨 Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });