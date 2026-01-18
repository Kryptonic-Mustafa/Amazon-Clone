import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Log that we are trying to fetch
    console.log("Attempting to fetch admin users...");

    // 2. Execute Query
    // We use 'any' to bypass strict typing issues during debug
    const [rows]: any = await db.query('SELECT * FROM admin_users');

    // 3. Log the result
    console.log("Database returned:", rows);

    return NextResponse.json(rows);
  } catch (error: any) {
    // 4. Log the EXACT error to your terminal
    console.error("❌ DATABASE ERROR:", error.message);
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, role, password } = await req.json();

    const [existing]: any = await db.query('SELECT id FROM admin_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const [result]: any = await db.query(
      'INSERT INTO admin_users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, password]
    );

    return NextResponse.json({ id: result.insertId, name, email, role, message: 'User created' });
  } catch (error: any) {
    console.error("❌ POST ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}