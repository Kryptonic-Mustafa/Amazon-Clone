import os
import re

FILES_TO_UPDATE = {
    # 1. EXPLICIT CATEGORIES API FIX
    "app/api/admin/categories/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({ 
      where: { is_active: true }, 
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const category = await prisma.categories.create({
      data: { name: data.name }
    });
    return NextResponse.json(category, { status: 201 });
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

    const category = await prisma.categories.update({
      where: { id: Number(id) },
      data: { name: data.name }
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
"""
}

def clean_all_api_routes():
    print("\n🔍 Scanning all API routes to permanently destroy duplicate keys...")
    api_dir = "app/api"
    fixed_count = 0
    
    if os.path.exists(api_dir):
        for root, _, files in os.walk(api_dir):
            for file in files:
                if file.endswith(".ts") or file.endswith(".tsx"):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    # Regex to find duplicate is_active keys regardless of spacing
                    new_content = re.sub(r'is_active:\s*true,\s*is_active:\s*true', 'is_active: true', content)
                    
                    if new_content != content:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"🧹 Cleaned duplicates in: {filepath}")
                        fixed_count += 1
                        
    print(f"✨ Purged duplicate keys in {fixed_count} additional files.")

if __name__ == "__main__":
    print("🚀 Fixing Categories API explicitly...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Re-written: {file_path}")
        
    # Run the global scanner
    clean_all_api_routes()
    
    print("\n🎉 DONE! You can now run `npm run build` with confidence.")