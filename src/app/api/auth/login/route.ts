import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { loginAdmin, setAdminCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const token = loginAdmin(password);
    if (!token) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    setAdminCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
