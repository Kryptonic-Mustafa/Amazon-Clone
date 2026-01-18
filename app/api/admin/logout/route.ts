// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Delete the cookie
  (await cookies()).delete('admin_token');
  
  return NextResponse.json({ success: true });
}