import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('shop_token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded: any = jwt.verify(token.value, JWT_SECRET);
    const { currentPassword, newPassword } = await req.json();

    // 1. Get User
    const [users]: any = await db.query('SELECT password_hash FROM users WHERE id = ?', [decoded.id]);
    const user = users[0];

    // 2. Verify Old Password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

    // 3. Hash New Password
    const newHash = await bcrypt.hash(newPassword, 10);

    // 4. Update DB
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, decoded.id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}