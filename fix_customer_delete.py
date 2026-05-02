import os

FILES_TO_UPDATE = {
    # 1. CUSTOMERS API (Fixing boolean to integer)
    "app/api/admin/customers/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await prisma.users.findUnique({ where: { id: Number(id) } });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: { name: data.name, email: data.email, phone: data.phone, address: data.address }
    });
    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // FIX: Changed is_active: false to is_active: 0 to match the integer schema
    await prisma.users.update({ where: { id: Number(id) }, data: { is_active: 0 } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
"""
}

def apply_fix():
    print("🚀 Fixing boolean/integer mismatch for TypeScript...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Fixed: {file_path}")

    print("\n🎉 DONE! The 'false' has been changed to '0'.")

if __name__ == "__main__":
    apply_fix()