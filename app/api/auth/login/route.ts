import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // <--- FIXED: Named import with brackets { }
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Check User
    // Note: ensure your table name matches (users vs user). Based on previous steps, it is 'users'
    const [users]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    const user = users[0];

    // 2. Check Password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Create Session Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role_ids },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('shop_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/' 
    });

    // Remove password from response
    const { password_hash, ...userWithoutPass } = user;
    return NextResponse.json({ user: userWithoutPass });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}