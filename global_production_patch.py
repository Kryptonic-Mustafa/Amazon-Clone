import os

FILES_TO_UPDATE = {
    # 1. ADMIN LOGIN API - Refactoring to use DATABASE_URL (via lib/db) and correct column names
    "app/api/admin/login/route.ts": r"""
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
""",

    # 2. ADMIN AUTH ME API - Ensuring consistency
    "app/api/admin/auth/me/route.ts": r"""
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
"""
}

def apply_fix():
    print("Patching Admin Auth System for Production (Vercel + TiDB)...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"Patched: {file_path}")
    print("\nDONE! Login should now work on Vercel.")


if __name__ == "__main__":
    apply_fix()