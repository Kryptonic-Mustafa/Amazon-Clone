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
