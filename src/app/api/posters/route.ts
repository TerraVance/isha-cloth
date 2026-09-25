import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — Public: fetch active posters; admin=true fetches all
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';

  let query = supabaseAdmin
    .from('hero_posters')
    .select('*, product:products(id, name, images)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (!isAdmin) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data || [] });
}

// POST — Admin: create a new poster
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { image_url, product_id, title, sort_order } = body;

    if (!image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('hero_posters')
      .insert({
        image_url,
        product_id: product_id || null,
        title: title || null,
        sort_order: sort_order ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    revalidatePath('/');
    return Response.json({ data }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to create poster' }, { status: 500 });
  }
}
