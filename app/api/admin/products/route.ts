import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper to save file
async function saveFile(file: File, productId: number): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId.toString());
  await mkdir(uploadDir, { recursive: true });
  const filename = `image-${Date.now()}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  return `/uploads/products/${productId}/${filename}`;
}

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract Fields
    const name = formData.get('name') as string;
    const price = formData.get('price');
    const description = formData.get('description') || '';
    const discount_percent = formData.get('discount_percent') || 0;
    const stock_qty = formData.get('stock_qty') || 0;
    const brand = formData.get('brand') || '';
    const sale_flag = formData.get('sale_flag') === '1' ? 1 : 0;
    
    // --- FIX: Handle as String (Comma Separated) ---
    // If frontend sends "1,2,3" it arrives here as string. 
    // If empty/null, default to empty string.
    let category_ids = formData.get('category_ids') as string;
    if (!category_ids || category_ids === 'null' || category_ids === 'undefined') {
        category_ids = '';
    }
    
    // Extract Image
    const imageFile = formData.get('imageFile') as File | null;
    const imageUrl = formData.get('imageUrl') as string;

    if (!name || !price) return NextResponse.json({ error: 'Name and Price required' }, { status: 400 });

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Insert
    const [result]: any = await db.query(
      `INSERT INTO products 
      (name, slug, description, price, discount_percent, sale_flag, stock_qty, brand, image_urls, category_ids) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, price, discount_percent, sale_flag, stock_qty, brand, imageUrl || '', category_ids]
    );

    const newProductId = result.insertId;
    let finalImagePath = imageUrl;

    if (imageFile && imageFile.size > 0) {
      finalImagePath = await saveFile(imageFile, newProductId);
      await db.query('UPDATE products SET image_urls = ? WHERE id = ?', [finalImagePath, newProductId]);
    }

    return NextResponse.json({ success: true, id: newProductId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}