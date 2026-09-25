import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — Admin: list all coupons
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data || [] });
}

// POST — Admin: create a new coupon
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { code, discount_percent, max_uses, min_order, is_active, expires_at } = body;

    if (!code || !discount_percent) {
      return Response.json({ error: 'code and discount_percent are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code: String(code).toUpperCase().trim(),
        discount_percent: Number(discount_percent),
        max_uses: max_uses ? Number(max_uses) : null,
        min_order: Number(min_order || 0),
        is_active: is_active !== false,
        expires_at: expires_at || null,
        times_used: 0,
      })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    revalidatePath('/');
    return Response.json({ data }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
