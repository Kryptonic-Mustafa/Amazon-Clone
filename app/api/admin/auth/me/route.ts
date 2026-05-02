import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 1. Verify Token
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 2. Fetch User from DB (Using lib/db pool which works in production)
    const [rows]: any = await db.query(
      'SELECT id, full_name as name, email, username FROM admin_users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error: any) {
    console.error('🚨 ADMIN AUTH ME CRASH:', error.message || error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
