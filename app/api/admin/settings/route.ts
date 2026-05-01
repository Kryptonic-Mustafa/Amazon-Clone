import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findFirst();
    
    if (!settings) {
      return NextResponse.json({ 
        website_name: 'AmazonClone', 
        tax_rate: 0, 
        country: 'KW',
        logo_url: '',
        favicon_url: ''
      }, { status: 200 });
    }
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const existing = await prisma.globalSettings.findFirst();
    
    let updatedSettings;
    if (existing) {
      updatedSettings = await prisma.globalSettings.update({
        where: { id: existing.id },
        data: {
          website_name: body.website_name,
          logo_url: body.logo_url,
          favicon_url: body.favicon_url,
          tax_rate: Number(body.tax_rate),
          country: body.country
        }
      });
    } else {
      updatedSettings = await prisma.globalSettings.create({
        data: {
          website_name: body.website_name || 'AmazonClone',
          logo_url: body.logo_url || '',
          favicon_url: body.favicon_url || '',
          tax_rate: Number(body.tax_rate) || 0,
          country: body.country || 'KW'
        }
      });
    }

    return NextResponse.json({ message: "Settings updated successfully", data: updatedSettings }, { status: 200 });
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
