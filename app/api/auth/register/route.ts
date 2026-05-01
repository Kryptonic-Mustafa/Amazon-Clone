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
