import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT — Admin: approve/reject/edit testimonial (🔄 Social Proof Loop)
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/testimonials/[id]'>) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ data });
}

// DELETE — Admin: remove testimonial
export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/testimonials/[id]'>) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;

  // Also delete photo from storage if it exists
  const { data: testimonial } = await supabaseAdmin
    .from('testimonials')
    .select('photo_url')
    .eq('id', id)
    .single();

  if (testimonial?.photo_url) {
    const path = testimonial.photo_url.split('/testimonials/')[1];
    if (path) await supabaseAdmin.storage.from('testimonials').remove([path]);
  }

  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ success: true });
}
