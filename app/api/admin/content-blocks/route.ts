import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch all content blocks for the admin list
export async function GET() {
  try {
    // Ensure your content_blocks table has these columns based on image
    const [rows] = await db.query('SELECT section_name, content_json, last_updated FROM content_blocks ORDER BY section_name ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update a specific content block
export async function PUT(req: Request) {
  try {
    const { section_name, content } = await req.json();

    if (!section_name || !content) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // The content object needs to be stringified for the JSON column
    const contentJsonString = JSON.stringify(content);

    await db.query(
      'UPDATE content_blocks SET content_json = ?, last_updated = CURRENT_TIMESTAMP WHERE section_name = ?',
      [contentJsonString, section_name]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Content Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}