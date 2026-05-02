import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.pageContent.findMany({ where: { is_active: true } });
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { section_key, content_en, content_ar } = await req.json();

    const updated = await prisma.pageContent.upsert({
      where: { section_key },
      update: { content_en, content_ar },
      create: { section_key, content_en, content_ar }
    });

    return NextResponse.json({ message: "Content saved successfully", data: updated }, { status: 200 });
  } catch (error) {
    console.error("CMS Save Error:", error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
