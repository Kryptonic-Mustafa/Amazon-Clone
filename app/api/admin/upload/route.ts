import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `img_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Save to standard Next.js public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    // Ensure directory exists
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL that will be saved in the database
    const fileUrl = `/uploads/products/${filename}`;
    
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
