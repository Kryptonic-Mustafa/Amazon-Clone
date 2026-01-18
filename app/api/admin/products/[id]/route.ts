import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function saveFile(file: File, productId: number): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId.toString());
  await mkdir(uploadDir, { recursive: true });
  const filename = `image-${Date.now()}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  return `/uploads/products/${productId}/${filename}`;
}

// --- FIX: Type definition includes Promise ---
type Props = {
  params: Promise<{ id: string }>
};

export async function PUT(req: Request, { params }: Props) {
  try {
    // --- FIX: Await params before using them ---
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const formData = await req.formData();

    const name = formData.get('name') as string;
    const price = formData.get('price');
    const description = formData.get('description');
    const stock_qty = formData.get('stock_qty');
    const brand = formData.get('brand');
    const discount_percent = formData.get('discount_percent');
    const sale_flag = formData.get('sale_flag');
    
    // Debug Log: Now 'id' will be correct (e.g., "6") instead of "undefined"
    const rawCatIds = formData.get('category_ids');
    console.log(`[UPDATE PRODUCT ${id}] Received Categories:`, rawCatIds);

    // Handle Category IDs (String format)
    let category_ids = '';
    if (rawCatIds && rawCatIds !== 'null' && rawCatIds !== 'undefined') {
        category_ids = String(rawCatIds);
    }
    
    // Handle Image
    let imageUrl = formData.get('imageUrl') as string;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveFile(imageFile, parseInt(id));
    }

    await db.query(
      `UPDATE products SET 
       name=?, price=?, description=?, stock_qty=?, discount_percent=?, 
       brand=?, sale_flag=?, image_urls=?, category_ids=? 
       WHERE id=?`,
      [
        name, price, description, stock_qty, discount_percent, 
        brand, sale_flag, imageUrl, category_ids, 
        id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    // --- FIX: Await params here too ---
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}