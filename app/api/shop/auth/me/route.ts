import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('shop_token');

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify Token
    const decoded: any = jwt.verify(token.value, JWT_SECRET);
    
    // Fetch fresh user data (in case address changed)
    const [users]: any = await db.query('SELECT id, name, email, phone, address, role_ids FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) return NextResponse.json({ user: null });

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}