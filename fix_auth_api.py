import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. FIXING REGISTER API (Refactoring to Prisma)
    # ==========================================
    "app/api/auth/register/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email.' }, { status: 400 });
    }

    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user using Prisma
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        phone: phone || null,
        address: address || null,
        is_active: 1
      }
    });

    // 4. Return success (excluding the password hash)
    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json({ message: 'User registered successfully', user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error("🚨 Registration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
""",

    # ==========================================
    # 2. FIXING LOGIN API (Refactoring to Prisma)
    # ==========================================
    "app/api/auth/login/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_this';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Find user in TiDB
    const user = await prisma.users.findFirst({
      where: { email, is_active: 1 }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Generate Session Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email: user.email } 
    }, { status: 200 });

    // 4. Set secure cookie
    response.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error("🚨 Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
"""
}

def apply_auth_fix():
    print("🚀 Patching Authentication routes to use Prisma + TiDB...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Refactored: {file_path}")

    print("\n🎉 DONE! Auth APIs are now robust and using your production database.")

if __name__ == "__main__":
    apply_auth_fix()