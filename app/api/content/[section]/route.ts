import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { section: string } }) {
  const url = new URL(req.url);
  const lang = url.searchParams.get('lang') || 'en';

  try {
    const content = await prisma.pageContent.findUnique({
      where: { section_key: params.section }
    });

    if (!content) {
      // Fallback empty data if nothing exists yet
      return NextResponse.json({}, { status: 200 });
    }

    // Serve strictly the requested language
    const data = lang === 'ar' ? content.content_ar : content.content_en;
    return NextResponse.json(data || {}, { status: 200 });
  } catch (error) {
    console.error(`Content GET Error [${params.section}]:`, error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
