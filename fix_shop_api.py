import os

FILES_TO_UPDATE = {
    "app/api/shop/products/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Safely fetching all products. 
    // We removed any strict 'where' clauses that might crash if a column name changed.
    const products = await prisma.products.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    // THIS WILL PRINT THE REAL ERROR IN YOUR TERMINAL!
    console.error("🚨 BACKEND CRASH IN SHOP API:", error.message || error);
    return NextResponse.json({ error: 'Failed to fetch products from database' }, { status: 500 });
  }
}
"""
}

def apply_fix():
    print("🚀 Patching Shop Products API...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Patched: {file_path}")
    print("\n🎉 DONE!")

if __name__ == "__main__":
    apply_fix()