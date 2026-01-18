import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. PUT: Update customer
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, password, phone, address, is_active } = await req.json();
    const { id } = await params;

    let query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, is_active = ?';
    let values = [name, email, phone, address, is_active];

    // Only update password if provided
    if (password) {
      query += ', password_hash = ?';
      values.push(password);
    }

    query += ' WHERE id = ?';
    values.push(id);

    await db.query(query, values);
    return NextResponse.json({ success: true, message: 'Customer updated' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. DELETE: Remove customer
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}