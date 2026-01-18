import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. GET ALL BRANDS
export async function GET() {
  try {
    const [brands]: any = await db.query('SELECT * FROM brands ORDER BY name ASC');
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ADD BRAND
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    await db.query('INSERT INTO brands (name) VALUES (?)', [name]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE BRAND
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await db.query('DELETE FROM brands WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}