import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT — Admin: update a poster (toggle active, reorder, change product)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('hero_posters')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    revalidatePath('/');
    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to update poster' }, { status: 500 });
  }
}

// DELETE — Admin: remove a poster
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('hero_posters')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  revalidatePath('/');
  return Response.json({ success: true });
}
