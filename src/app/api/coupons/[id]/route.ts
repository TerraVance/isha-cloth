import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT — Admin: update a coupon (toggle active, change discount, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    // Auto-uppercase code if being updated
    if (body.code) body.code = String(body.code).toUpperCase().trim();

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    revalidatePath('/');
    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE — Admin: remove a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ success: true });
}
