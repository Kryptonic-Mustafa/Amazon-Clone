// app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = 'your-secret-key-change-this'; // In production, use .env file

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Check Database
    // We select the user where email matches
    const [rows]: any = await db.query(
      'SELECT * FROM admin_users WHERE email = ?', 
      [email]
    );

    // 2. Validate User
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const admin = rows[0];

    // 3. Check Password 
    // (Direct comparison since your DB has "123456". In a real app, use bcrypt!)
    if (password !== admin.password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 4. Create Token
    const token = jwt.sign(
      { id: admin.id, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Set Cookie
    (await cookies()).set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}