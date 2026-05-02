import os

FILES_TO_UPDATE = {
    # 1. BRANDS API (Removing the duplicate key)
    "app/api/admin/brands/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // FIX: Removed the duplicate 'is_active: true' key
    const brands = await prisma.brands.findMany({ 
      where: { is_active: true }, 
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const brand = await prisma.brands.create({
      data: { name: data.name }
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await req.json();
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const brand = await prisma.brands.update({
      where: { id: Number(id) },
      data: { name: data.name }
    });
    return NextResponse.json(brand, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
"""
}

def apply_fix():
    print("🚀 Fixing Duplicate Key Error in Brands API...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Cleaned up: {file_path}")

    print("\n🎉 DONE! The TypeScript compiler will now be happy.")

if __name__ == "__main__":
    apply_fix()