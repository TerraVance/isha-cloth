import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAdminCookie(response);
  return response;
}
