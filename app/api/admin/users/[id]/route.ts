import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. PUT: Update an existing user
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, role, password } = await req.json();
    const { id } = await params; // Await params in Next.js 15+

    // If password is provided, update it. If not, keep old password.
    let query = 'UPDATE admin_users SET name = ?, email = ?, role = ?';
    let values = [name, email, role];

    if (password) {
      query += ', password = ?';
      values.push(password);
    }

    query += ' WHERE id = ?';
    values.push(id);

    await db.query(query, values);
    return NextResponse.json({ success: true, message: 'User updated' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. DELETE: Remove a user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await db.query('DELETE FROM admin_users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}