import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // --- DEBUGGING START ---
    console.log("------------------------------------------------");
    console.log("Attempting Login for:", email);
    
    // 1. Check User
    const [users]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log("❌ User not found in DB");
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    const user = users[0];
    console.log("✅ User found:", user.email);
    console.log("🔑 Hash in DB:", user.password_hash);

    // GENERATE A NEW HASH FOR "password" to compare
    const newHash = await bcrypt.hash(password, 10);
    console.log("🛠️  CORRECT HASH for '" + password + "' is:");
    console.log(newHash); 
    console.log("------------------------------------------------");
    // --- DEBUGGING END ---

    // 2. Check Password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      console.log("❌ Password mismatch");
      // INSTRUCTION: Copy the 'newHash' from your terminal and update your DB with it!
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log("✅ Password Matched!");

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
      maxAge: 60 * 60 * 24 * 7,
      path: '/' 
    });

    const { password_hash, ...userWithoutPass } = user;
    return NextResponse.json({ user: userWithoutPass });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}