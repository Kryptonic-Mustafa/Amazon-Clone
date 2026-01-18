import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. GET: Fetch all customers (users table)
export async function GET() {
  try {
    // We select specific fields to avoid sending passwords
    const [rows] = await db.query('SELECT id, name, email, phone, address, is_active, created_at FROM users ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Create a new customer
export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address, is_active } = await req.json();

    // Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, Email and Password are required' }, { status: 400 });
    }

    // Check Duplicate
    const [existing]: any = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Insert
    // Note: We use 'users' table as per your schema
    const [result]: any = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, address, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone || null, address || null, is_active ?? 1] // Default active to 1
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Customer created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}