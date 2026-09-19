import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ============================================================
// Login — validate password and return JWT
// ============================================================
export function loginAdmin(password: string): string | null {
  if (password !== ADMIN_PASSWORD) return null;
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

// ============================================================
// Set auth cookie on a NextResponse
// ============================================================
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// ============================================================
// Clear auth cookie (logout)
// ============================================================
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

// ============================================================
// Verify admin — returns true if request has valid JWT cookie
// ============================================================
export function verifyAdmin(request: NextRequest): boolean {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// ============================================================
// Middleware helper — returns 401 if not authenticated
// ============================================================
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
