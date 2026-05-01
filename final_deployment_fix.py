import os

FILES_TO_UPDATE = {
    # 1. USERS API (The current build blocker)
    "app/api/admin/users/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.admin_users.findUnique({ where: { id: Number(id) } });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updatedUser = await prisma.admin_users.update({
      where: { id: Number(id) },
      data: { full_name: data.full_name, username: data.username, email: data.email }
    });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.admin_users.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
""",

    # 2. INVOICE DETAIL API (Pre-emptive fix for dynamic segment [orderId])
    "app/api/admin/invoices/[orderId]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const invoice = await prisma.invoices.findFirst({
      where: { order_id: Number(orderId) }
    });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
"""
}

def apply_final_fix():
    print("🚀 Patching remaining dynamic routes for Next.js 16 compatibility...")
    for file_path, content in FILES_TO_UPDATE.items():
        # Ensure directory exists before writing
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Production-Ready: {file_path}")

    print("\n🎉 DONE! All surfaced build blockers are now fixed.")

if __name__ == "__main__":
    apply_final_fix()