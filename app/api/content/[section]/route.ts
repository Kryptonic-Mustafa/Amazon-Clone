import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure fresh data is fetched

type Props = {
    params: Promise<{ section: string }>
};

// GET: Fetch content for a specific section name
export async function GET(req: Request, { params }: Props) {
  try {
    const resolvedParams = await params;
    const sectionName = resolvedParams.section;

    const [rows]: any = await db.query(
      'SELECT content_json FROM content_blocks WHERE section_name = ?',
      [sectionName]
    );

    if (rows.length === 0) {
      // Return empty object if block doesn't exist yet, to prevent frontend crashes
      return NextResponse.json({});
    }

    // Parse the JSON string from the database back into a JSON object before sending
    let parsedContent = {};
    try {
        parsedContent = typeof rows[0].content_json === 'string' 
            ? JSON.parse(rows[0].content_json) 
            : rows[0].content_json;
    } catch (e) {
        console.error("Failed to parse content JSON:", e);
    }

    return NextResponse.json(parsedContent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}