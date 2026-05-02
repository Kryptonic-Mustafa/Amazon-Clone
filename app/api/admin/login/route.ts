import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Check Database using the connection pool (now production-ready)
    const [rows]: any = await db.query(
      'SELECT id, full_name, email, password, is_active FROM admin_users WHERE email = ?', 
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const admin = rows[0];

    // 2. Validate Active Status
    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }

    // 3. Check Password (Direct comparison for now as per your DB setup)
    if (password !== admin.password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 4. Create Token with correct data
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.full_name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Set Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('🚨 ADMIN LOGIN CRASH:', error.message || error);
    return NextResponse.json({ error: 'Server error during authentication' }, { status: 500 });
  }
}
