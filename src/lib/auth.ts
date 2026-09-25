import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secretKey = new TextEncoder().encode(JWT_SECRET);

// ============================================================
// Login — validate password and return JWT
// ============================================================
export async function loginAdmin(password: string): Promise<string | null> {
  if (password !== ADMIN_PASSWORD) return null;
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
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
export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// ============================================================
// Middleware helper — returns 401 if not authenticated
// ============================================================
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const isValid = await verifyAdmin(request);
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
