import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if user exists
    const [existing]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    
    // Default role_id '3' (Customer) - assuming 1=Admin, 2=Manager, 3=Customer
    // Storing as string "3"
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role_ids) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, "3"]
    );

    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}