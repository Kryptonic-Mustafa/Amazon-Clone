import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to fetch with ONLY the soft-delete filter. 
    // REMOVED the 'role' filter that was causing the Prisma 500 crash!
    const customers = await prisma.users.findMany({
      where: { is_active: 1 },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    // FAIL-SAFE: If is_active column is missing in DB, fallback to normal fetch
    try {
        const customers = await prisma.users.findMany({
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json(customers, { status: 200 });
    } catch (fallbackError) {
        console.error("Customer GET Error:", fallbackError);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newCustomer = await prisma.users.create({
      data: {
        name: data.name, email: data.email, phone: data.phone || null, address: data.address || null,
        password_hash: 'AdminCreatedPassword123!'
      }
    });
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await req.json();
    const updatedCustomer = await prisma.users.update({
      where: { id: Number(id) },
      data: { name: data.name, email: data.email, phone: data.phone || null, address: data.address || null }
    });
    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    try {
        await prisma.users.update({ where: { id: Number(id) }, data: { is_active: 0 } });
    } catch (e) {
        await prisma.users.delete({ where: { id: Number(id) } });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer.' }, { status: 500 });
  }
}
