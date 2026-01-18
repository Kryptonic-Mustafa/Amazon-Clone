import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 
import bcrypt from 'bcryptjs'; // Import bcrypt

export async function POST(req: Request) {
  try {
    const { customer, items, total } = await req.json();

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    let userId = null;

    const [existingUsers]: any = await db.query('SELECT id FROM users WHERE email = ?', [customer.email]);

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      // FIX: Hash the default password
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const [newUserResult]: any = await db.query(
        `INSERT INTO users (name, email, phone, address, password_hash, role_ids, is_active) 
         VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
        [customer.name, customer.email, customer.phone, customer.address, hashedPassword]
      );
      userId = newUserResult.insertId;
    }

    // ... (Rest of your existing order creation code remains exactly the same) ...
    const [orderResult]: any = await db.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, customer.name, customer.email, customer.phone, customer.address, total]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id, item.name, item.quantity, item.price]
      );
      await db.query('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?', [item.quantity, item.id]);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}