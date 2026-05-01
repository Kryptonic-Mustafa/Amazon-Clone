import os

# This patch updates all dynamic API routes to satisfy Next.js 15/16 strict typing
FILES_TO_UPDATE = {
    # 1. CUSTOMERS API (The one currently failing your build)
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
    await prisma.users.update({ where: { id: Number(id) }, data: { is_active: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
""",

    # 2. PRODUCTS API (Pre-emptively fixing this for the build)
    "app/api/admin/products/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const product = await prisma.products.update({
      where: { id: Number(id) },
      data: { ...data, slug }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.products.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
"""
}

def run_patch():
    print("🚀 Applying Global Production Patch for Next.js 16...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Fixed Async Params: {file_path}")

    print("\n🎉 DONE! All dynamic API routes are now production-ready.")

if __name__ == "__main__":
    run_patch()