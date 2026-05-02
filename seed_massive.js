const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate random items
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

const firstNames = ['Ahmed','Sara','Omar','Fatima','Ali','Noor','Hassan','Layla','Yusuf','Amina','Khalid','Huda','Tariq','Mariam','Zaid','Rania','Ibrahim','Dina','Faisal','Lina','Amir','Salma','Bilal','Hana','Jamal','Rana','Sami','Mona','Rami','Nadia','Karim','Leila','Walid','Yasmin','Adel','Farah','Nabil','Dana','Samir','Ghada','Hamza','Dalal','Majid','Aisha','Rashid','Lubna','Hamed','Noura','Badr','Suha'];
const lastNames = ['Khan','Ahmed','Ali','Hassan','Ibrahim','Mohammed','Al-Rashid','Al-Nasser','Malik','Sheikh','Bukhari','Ansari','Farooq','Siddiqui','Mirza','Qureshi','Aziz','Habib','Zaman','Iqbal'];
const cities = ['Mumbai','Delhi','Bangalore','Kuwait City','Dubai','Riyadh','Jeddah','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Lucknow','Kochi','Doha','Muscat','Manama','Sharjah','Abu Dhabi','Karachi'];
const streets = ['Al Salam St','MG Road','Park Avenue','King Fahd Rd','Sheikh Zayed Rd','Nehru Place','Commercial Area','Block 5','Sector 21','Gandhi Nagar'];

const brandNames = ['Apple','Samsung','Nike','Sony','Adidas','Puma','Dell','HP','Lenovo','LG','OnePlus','Xiaomi','Boat','JBL','Philips','Canon','Nikon','Bose','Fossil','Casio','Saif Al Burhan','Arts Studio','Adoni','Zara','H&M','Gucci','Versace','Dior','Chanel','Titan'];
const categoryNames = ['Electronics','Fashion','Attar','ArtsStudio','Home & Kitchen','Sports','Books','Beauty','Toys','Automotive','Grocery','Health','Jewelry','Shoes','Bags','Watches','Furniture','Gaming','Photography','Music'];

const productData = [
  {n:'MacBook Pro M3',b:'Apple',p:'1899.99',d:'Flagship laptop with M3 chip, 16GB RAM, 512GB SSD',cat:'Electronics',disc:8,r:'4.9'},
  {n:'iPhone 15 Pro Max',b:'Apple',p:'1299.00',d:'Latest iPhone with titanium design and A17 Pro chip',cat:'Electronics',disc:5,r:'4.8'},
  {n:'Samsung Galaxy S24 Ultra',b:'Samsung',p:'1199.99',d:'Premium Android flagship with AI features and S-Pen',cat:'Electronics',disc:10,r:'4.7'},
  {n:'AirPods Pro 2',b:'Apple',p:'249.00',d:'Active noise cancellation with adaptive audio',cat:'Electronics',disc:0,r:'4.6'},
  {n:'Nike Air Max 270',b:'Nike',p:'150.00',d:'Iconic lifestyle sneakers with Max Air unit',cat:'Shoes',disc:15,r:'4.5'},
  {n:'Sony WH-1000XM5',b:'Sony',p:'349.99',d:'Industry-leading noise canceling headphones',cat:'Electronics',disc:12,r:'4.8'},
  {n:'Oud Musk Zaffran',b:'Saif Al Burhan',p:'125.00',d:'Luxurious oud with musk and saffron essence',cat:'Attar',disc:5,r:'4.5'},
  {n:'Mona Lisa Canvas Print',b:'Arts Studio',p:'350.00',d:'Premium hand-finished canvas art reproduction',cat:'ArtsStudio',disc:0,r:'4.3'},
  {n:'Dell XPS 15',b:'Dell',p:'1499.00',d:'Ultra-thin laptop with InfinityEdge display',cat:'Electronics',disc:7,r:'4.6'},
  {n:'Adidas Ultraboost 23',b:'Adidas',p:'180.00',d:'Premium running shoes with Boost midsole',cat:'Shoes',disc:20,r:'4.7'},
  {n:'iPad Air M2',b:'Apple',p:'599.00',d:'Versatile tablet with M2 chip and Liquid Retina display',cat:'Electronics',disc:0,r:'4.7'},
  {n:'Samsung 65" QLED TV',b:'Samsung',p:'999.99',d:'4K Smart TV with Quantum Dot technology',cat:'Electronics',disc:15,r:'4.5'},
  {n:'Puma RS-X',b:'Puma',p:'110.00',d:'Retro-futuristic running sneakers',cat:'Shoes',disc:25,r:'4.2'},
  {n:'Canon EOS R6 II',b:'Canon',p:'2499.00',d:'Full-frame mirrorless camera, 24.2MP, 4K60',cat:'Photography',disc:5,r:'4.9'},
  {n:'Bose QuietComfort Ultra',b:'Bose',p:'429.00',d:'Spatial audio headphones with world-class ANC',cat:'Electronics',disc:0,r:'4.7'},
  {n:'Night Suit Pajamas',b:'Adoni',p:'180.00',d:'Premium cotton night suit set, ultra-comfortable',cat:'Fashion',disc:10,r:'4.1'},
  {n:'Abaya Collection Black',b:'Adoni',p:'200.00',d:'Elegant black abaya with intricate embroidery',cat:'Fashion',disc:0,r:'4.4'},
  {n:'RUH E KHAS Attar',b:'Saif Al Burhan',p:'500.00',d:'Premium Indian attar with rose and sandalwood notes',cat:'Attar',disc:0,r:'4.8'},
  {n:'Abstract Wall Art Set',b:'Arts Studio',p:'275.00',d:'Set of 3 modern abstract canvas prints',cat:'ArtsStudio',disc:10,r:'4.2'},
  {n:'OnePlus 12',b:'OnePlus',p:'799.00',d:'Flagship killer with Snapdragon 8 Gen 3',cat:'Electronics',disc:8,r:'4.6'},
  {n:'Xiaomi Smart Band 8',b:'Xiaomi',p:'39.99',d:'Fitness tracker with AMOLED display',cat:'Electronics',disc:0,r:'4.3'},
  {n:'JBL Flip 6',b:'JBL',p:'129.95',d:'Portable waterproof Bluetooth speaker',cat:'Electronics',disc:10,r:'4.5'},
  {n:'Boat Airdopes 441',b:'Boat',p:'49.99',d:'TWS earbuds with 150H playback and low latency',cat:'Electronics',disc:30,r:'4.0'},
  {n:'HP Spectre x360',b:'HP',p:'1349.00',d:'2-in-1 convertible laptop with OLED display',cat:'Electronics',disc:5,r:'4.5'},
  {n:'Lenovo ThinkPad X1',b:'Lenovo',p:'1599.00',d:'Business ultrabook with military-grade durability',cat:'Electronics',disc:0,r:'4.7'},
  {n:'LG 27" UltraGear Monitor',b:'LG',p:'349.99',d:'QHD 165Hz gaming monitor with G-Sync',cat:'Gaming',disc:12,r:'4.6'},
  {n:'Fossil Gen 6 Watch',b:'Fossil',p:'299.00',d:'Wear OS smartwatch with SpO2 and heart rate',cat:'Watches',disc:20,r:'4.1'},
  {n:'Casio G-Shock GA-2100',b:'Casio',p:'99.00',d:'Iconic octagonal watch, carbon core guard',cat:'Watches',disc:0,r:'4.8'},
  {n:'Philips Air Fryer XXL',b:'Philips',p:'249.95',d:'Family-size air fryer with fat removal technology',cat:'Home & Kitchen',disc:15,r:'4.4'},
  {n:'Nikon Z5 Camera',b:'Nikon',p:'1396.95',d:'Full-frame mirrorless, 24.3MP, 4K UHD video',cat:'Photography',disc:8,r:'4.5'},
  {n:'Nike Dunk Low Panda',b:'Nike',p:'110.00',d:'Classic two-tone basketball sneakers',cat:'Shoes',disc:0,r:'4.9'},
  {n:'Samsung Galaxy Tab S9',b:'Samsung',p:'799.99',d:'Premium Android tablet with S-Pen included',cat:'Electronics',disc:5,r:'4.6'},
  {n:'Sony PS5 DualSense',b:'Sony',p:'69.99',d:'Wireless controller with haptic feedback',cat:'Gaming',disc:0,r:'4.7'},
  {n:'Amber Oud Royale',b:'Saif Al Burhan',p:'350.00',d:'Royal amber oud with deep woody base notes',cat:'Attar',disc:0,r:'4.9'},
  {n:'Starry Night Print',b:'Arts Studio',p:'420.00',d:'Van Gogh inspired premium gallery wrap canvas',cat:'ArtsStudio',disc:5,r:'4.6'},
  {n:'Zara Linen Blazer',b:'Zara',p:'89.90',d:'Relaxed fit linen blend blazer in beige',cat:'Fashion',disc:0,r:'4.2'},
  {n:'H&M Slim Fit Chinos',b:'H&M',p:'34.99',d:'Stretch cotton chinos in multiple colors',cat:'Fashion',disc:10,r:'4.0'},
  {n:'Titan Raga Watch',b:'Titan',p:'175.00',d:'Elegant women\'s analog watch with bracelet strap',cat:'Watches',disc:0,r:'4.3'},
  {n:'Gucci Flora Perfume',b:'Gucci',p:'135.00',d:'Floral fragrance with gardenia and jasmine',cat:'Beauty',disc:0,r:'4.7'},
  {n:'Versace Eros EDT',b:'Versace',p:'98.00',d:'Bold masculine fragrance with mint and vanilla',cat:'Beauty',disc:5,r:'4.6'},
  {n:'Dior Sauvage EDP',b:'Dior',p:'155.00',d:'Iconic men\'s fragrance with ambroxan and vanilla',cat:'Beauty',disc:0,r:'4.9'},
  {n:'Chanel No.5 L\'Eau',b:'Chanel',p:'142.00',d:'Modern interpretation of the classic No.5',cat:'Beauty',disc:0,r:'4.8'},
  {n:'Nike Pro Dri-FIT Tee',b:'Nike',p:'35.00',d:'Performance training tee with moisture wicking',cat:'Sports',disc:15,r:'4.3'},
  {n:'Adidas Predator Boots',b:'Adidas',p:'220.00',d:'Firm ground football boots with Controlskin',cat:'Sports',disc:10,r:'4.5'},
  {n:'Sony Alpha A7 IV',b:'Sony',p:'2498.00',d:'Full-frame hybrid camera, 33MP, 4K60 10-bit',cat:'Photography',disc:0,r:'4.9'},
  {n:'Apple Watch Ultra 2',b:'Apple',p:'799.00',d:'Rugged smartwatch with precision dual-frequency GPS',cat:'Watches',disc:0,r:'4.8'},
  {n:'Dell 34" Ultrawide',b:'Dell',p:'549.99',d:'Curved WQHD ultrawide monitor for productivity',cat:'Electronics',disc:10,r:'4.4'},
  {n:'Puma Future Rider',b:'Puma',p:'85.00',d:'Retro-style lifestyle sneakers',cat:'Shoes',disc:20,r:'4.1'},
  {n:'Calligraphy Art Set',b:'Arts Studio',p:'190.00',d:'Arabic calligraphy art with gold leaf accents',cat:'ArtsStudio',disc:0,r:'4.7'},
  {n:'White Musk Attar',b:'Saif Al Burhan',p:'85.00',d:'Pure white musk oil, long lasting and subtle',cat:'Attar',disc:10,r:'4.4'},
  {n:'Xiaomi Robot Vacuum',b:'Xiaomi',p:'299.00',d:'Smart robot vacuum with LiDAR navigation',cat:'Home & Kitchen',disc:15,r:'4.3'},
  {n:'Boat Rockerz 550',b:'Boat',p:'59.99',d:'Over-ear wireless headphones with 20H battery',cat:'Electronics',disc:25,r:'4.1'},
];

const reviewComments = [
  'Absolutely love this product! Exceeded all my expectations.',
  'Great quality for the price. Would definitely recommend.',
  'Fast shipping and exactly as described. Very happy!',
  'Good product but packaging could be better.',
  'Premium quality, feels very luxurious. Worth every penny.',
  'Been using it for a month now, works perfectly.',
  'Decent product, nothing extraordinary but does the job.',
  'Amazing build quality and design. Five stars!',
  'Not what I expected, but still a solid purchase.',
  'Best purchase I\'ve made this year. Highly recommend!',
  'The quality is outstanding. Will buy again.',
  'Perfect gift for my family. They loved it!',
  'Smooth experience from ordering to delivery.',
  'Could be improved but overall satisfied.',
  'Fantastic product! Using it daily without any issues.',
];

const orderStatuses = ['Pending','Processing','Shipped','Delivered','Cancelled'];
const paymentStatuses = ['pending','paid','failed','refunded'];
const supplierNames = ['Global Supplies Co','MegaTrade Int.','Arabian Imports LLC','TechVenture Ltd','Eastern Commodities','Pacific Distributors','Atlas Trading Co','Summit Wholesale','Crescent Supplies','Delta Logistics'];
const quoteStatuses = ['Pending','Approved','Rejected','Expired'];

async function main() {
  console.log('Starting massive seed...');

  // 1. Admin Users (2 more + existing)
  console.log('Seeding admin_users...');
  await prisma.admin_users.createMany({ data: [
    { full_name: 'Operations Manager', username: 'ops_manager', email: 'ops@company.com', password: '123456', is_sa: false, is_active: true },
    { full_name: 'Content Editor', username: 'editor', email: 'editor@company.com', password: '123456', is_sa: false, is_active: true },
  ], skipDuplicates: true });

  // 2. Brands (30)
  console.log('Seeding brands...');
  await prisma.brands.createMany({ data: brandNames.map(name => ({ name, is_active: true })), skipDuplicates: true });

  // 3. Categories (20)
  console.log('Seeding categories...');
  await prisma.categories.createMany({ data: categoryNames.map(name => ({ name, parent_id: 0, is_active: true })), skipDuplicates: true });

  // 4. Products (52)
  console.log('Seeding products...');
  for (const p of productData) {
    const existing = await prisma.products.findFirst({ where: { slug: slug(p.n) } });
    if (!existing) {
      await prisma.products.create({ data: {
        name: p.n, slug: slug(p.n), description: p.d, price: p.p,
        discount_percent: p.disc, sale_flag: p.disc > 0 ? 1 : 0,
        stock_qty: rand(5, 200), brand: p.b, rating: p.r, is_active: true,
      }});
    }
  }

  // 5. Users / Customers (200+)
  console.log('Seeding 200+ customers...');
  const customerData = [];
  for (let i = 1; i <= 210; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    customerData.push({
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${i}@${pick(['gmail.com','yahoo.com','outlook.com','hotmail.com'])}`,
      password_hash: '$2a$10$dummyHashedPasswordForSeedingPurposesOnly1234',
      phone: `+${pick(['91','965','971','966','974'])}${rand(7000000000, 9999999999)}`,
      address: `${rand(1,999)} ${pick(streets)}, ${pick(cities)}`,
      is_active: 1,
    });
  }
  await prisma.users.createMany({ data: customerData, skipDuplicates: true });

  // Fetch all products and users for references
  const allProducts = await prisma.products.findMany({ select: { id: true, name: true, price: true } });
  const allUsers = await prisma.users.findMany({ select: { id: true, name: true, email: true, phone: true, address: true } });

  // 6. Orders (60+)
  console.log('Seeding 60+ orders...');
  for (let i = 0; i < 65; i++) {
    const user = pick(allUsers);
    const itemCount = rand(1, 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const prod = pick(allProducts);
      const qty = rand(1, 3);
      const price = Number(prod.price);
      total += price * qty;
      items.push({ product_id: prod.id, product_name: prod.name, quantity: qty, price: price.toFixed(2) });
    }

    const status = pick(orderStatuses);
    const payStatus = status === 'Delivered' ? 'paid' : status === 'Cancelled' ? 'failed' : pick(paymentStatuses);
    const createdAt = new Date(Date.now() - rand(1, 90) * 86400000);

    const order = await prisma.orders.create({ data: {
      customer_name: user.name, customer_email: user.email, customer_phone: user.phone,
      user_id: user.id, total_amount: total.toFixed(2), status, payment_status: payStatus,
      invoice_no: `INV-${Date.now()}-${rand(1000,9999)}`,
      shipping_address: user.address || `${rand(1,500)} ${pick(streets)}, ${pick(cities)}`,
      created_at: createdAt, viewed: Math.random() > 0.5,
    }});

    // Order Items
    for (const item of items) {
      await prisma.order_items.create({ data: { order_id: order.id, ...item } });
    }
  }

  // 7. Invoices (50+)
  console.log('Seeding 50+ invoices...');
  const deliveredOrders = await prisma.orders.findMany({ where: { status: 'Delivered' }, take: 55 });
  for (const order of deliveredOrders) {
    const existing = await prisma.invoices.findFirst({ where: { order_id: order.id } });
    if (!existing) {
      await prisma.invoices.create({ data: {
        invoice_number: `SINV-${order.id}-${rand(1000,9999)}`,
        order_id: order.id, customer_name: order.customer_name,
        customer_address: order.shipping_address,
        total_amount: order.total_amount,
        tax_amount: (Number(order.total_amount) * 0.05).toFixed(2),
      }});
    }
  }

  // 8. Reviews (80+)
  console.log('Seeding 80+ reviews...');
  for (let i = 0; i < 85; i++) {
    const prod = pick(allProducts);
    const user = pick(allUsers);
    await prisma.reviews.create({ data: {
      product_id: prod.id, user_id: user.id, user_name: user.name,
      rating: rand(3, 5), comment: pick(reviewComments),
      created_at: new Date(Date.now() - rand(1, 60) * 86400000),
    }});
  }

  // 9. Ledger (50+)
  console.log('Seeding 50+ ledger entries...');
  let balance = 0;
  const ledgerTypes = ['INVOICE', 'PAYMENT', 'REFUND', 'EXPENSE'];
  for (let i = 0; i < 55; i++) {
    const type = pick(ledgerTypes);
    const amount = parseFloat((Math.random() * 500 + 20).toFixed(2));
    const isDebit = type === 'EXPENSE' || type === 'REFUND';
    balance = isDebit ? balance - amount : balance + amount;
    await prisma.ledger.create({ data: {
      description: type === 'INVOICE' ? `Invoice payment #${rand(1000,9999)}` : type === 'PAYMENT' ? `Customer payment received` : type === 'REFUND' ? `Refund processed #${rand(100,999)}` : `Operational expense - ${pick(['shipping','packaging','utilities','marketing'])}`,
      reference_id: rand(1, 100), type,
      debit: isDebit ? amount.toFixed(2) : '0.00',
      credit: !isDebit ? amount.toFixed(2) : '0.00',
      balance: balance.toFixed(2),
      transaction_date: new Date(Date.now() - rand(1, 90) * 86400000),
    }});
  }

  // 10. Offers (10)
  console.log('Seeding offers...');
  const offerCodes = ['WELCOME10','SUMMER20','FLASH15','VIP25','NEW5','FESTIVE30','LOYALTY10','WEEKEND15','MEGA50','SEASON20'];
  await prisma.offers.createMany({ data: offerCodes.map((code, i) => ({
    code, discount_amount: parseFloat(code.match(/\d+/)[0]), is_active: 1,
  })), skipDuplicates: true });

  // 11. Quotations (20)
  console.log('Seeding quotations...');
  for (let i = 0; i < 20; i++) {
    const user = pick(allUsers);
    const qItems = [];
    let qTotal = 0;
    for (let j = 0; j < rand(1, 5); j++) {
      const p = pick(allProducts);
      const qty = rand(1, 10);
      qTotal += Number(p.price) * qty;
      qItems.push({ product: p.name, qty, unit_price: Number(p.price) });
    }
    await prisma.quotations.create({ data: {
      customer_name: user.name, email: user.email, total_amount: qTotal.toFixed(2),
      status: pick(quoteStatuses), items: JSON.stringify(qItems),
      created_at: new Date(Date.now() - rand(1, 30) * 86400000),
    }});
  }

  // 12. Purchase Orders (20)
  console.log('Seeding purchase orders...');
  for (let i = 0; i < 20; i++) {
    const poItems = [];
    let poTotal = 0;
    for (let j = 0; j < rand(2, 6); j++) {
      const p = pick(allProducts);
      const qty = rand(10, 100);
      const cost = (Number(p.price) * 0.6).toFixed(2);
      poTotal += parseFloat(cost) * qty;
      poItems.push({ product: p.name, qty, cost_per_unit: parseFloat(cost) });
    }
    await prisma.purchase_orders.create({ data: {
      supplier_name: pick(supplierNames), total_amount: poTotal.toFixed(2),
      status: pick(['Draft','Sent','Received','Cancelled']),
      items: JSON.stringify(poItems),
      created_at: new Date(Date.now() - rand(1, 60) * 86400000),
    }});
  }

  // 13. Permissions & Roles
  console.log('Seeding permissions & roles...');
  const perms = ['manage_products','manage_orders','manage_users','manage_invoices','manage_settings','view_dashboard','manage_inventory','manage_content','manage_reviews','manage_accounts'];
  await prisma.permissions.createMany({ data: perms.map(slug => ({ slug, description: slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) })), skipDuplicates: true });
  await prisma.roles.createMany({ data: [
    { name: 'Super Admin', permission_ids: '1,2,3,4,5,6,7,8,9,10' },
    { name: 'Manager', permission_ids: '1,2,4,6,7' },
    { name: 'Editor', permission_ids: '1,8,9' },
    { name: 'Viewer', permission_ids: '6' },
  ], skipDuplicates: true });

  // 14. Tax Settings
  console.log('Seeding tax settings...');
  await prisma.tax_settings.createMany({ data: [
    { tax_name: 'VAT', rate_percent: '5.00', is_active: true },
    { tax_name: 'Service Tax', rate_percent: '12.00', is_active: true },
  ], skipDuplicates: true });

  // 15. GlobalSettings
  console.log('Seeding global settings...');
  const gs = await prisma.globalSettings.findFirst();
  if (!gs) {
    await prisma.globalSettings.create({ data: { website_name: 'AmazonClone', tax_rate: 5, country: 'KW' }});
  }

  console.log('\n=== MASSIVE SEED COMPLETE ===');
  const counts = {
    admin_users: await prisma.admin_users.count(),
    brands: await prisma.brands.count(),
    categories: await prisma.categories.count(),
    products: await prisma.products.count(),
    users: await prisma.users.count(),
    orders: await prisma.orders.count(),
    order_items: await prisma.order_items.count(),
    invoices: await prisma.invoices.count(),
    reviews: await prisma.reviews.count(),
    ledger: await prisma.ledger.count(),
    offers: await prisma.offers.count(),
    quotations: await prisma.quotations.count(),
    purchase_orders: await prisma.purchase_orders.count(),
    permissions: await prisma.permissions.count(),
    roles: await prisma.roles.count(),
  };
  console.table(counts);
}

main()
  .catch(e => { console.error('SEED ERROR:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
