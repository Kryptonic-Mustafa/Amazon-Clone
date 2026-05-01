import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brands.findMany({ where: { is_active: true,  is_active: true }, orderBy: { name: 'asc' } });
    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const brand = await prisma.brands.create({ data: { name } });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await req.json();
    const brand = await prisma.brands.update({ where: { id }, data: { name } });
    return NextResponse.json(brand, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
