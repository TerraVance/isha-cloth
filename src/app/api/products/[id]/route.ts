import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — Public: single product by ID
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'Product not found' }, { status: 404 });
  return Response.json({ data });
}

// PUT — Admin only: update product
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ data });
}

// DELETE — Admin only: delete product
export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;

  // Also remove from Supabase Storage (images)
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('images')
    .eq('id', id)
    .single();

  if (product?.images?.length) {
    const paths = product.images.map((url: string) => url.split('/products/')[1]).filter(Boolean);
    if (paths.length) await supabaseAdmin.storage.from('products').remove(paths);
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ success: true });
}
