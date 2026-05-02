import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { order_id, product_id, product_name, quantity, return_reason } = body;

    // Validate order belongs to user and is completed
    const order = await prisma.orders.findFirst({
      where: { id: order_id, user_id: userId, status: 'Completed' }
    });

    if (!order) {
      return NextResponse.json({ error: 'Invalid order or order not eligible for return' }, { status: 400 });
    }

    // Create return record
    const salesReturn = await prisma.sales_returns.create({
      data: {
        order_id,
        user_id: userId,
        product_id,
        product_name,
        quantity,
        return_reason,
        status: 'Pending'
      }
    });

    return NextResponse.json(salesReturn, { status: 201 });
  } catch (error) {
    console.error('Create Return Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const returns = await prisma.sales_returns.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(returns, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
