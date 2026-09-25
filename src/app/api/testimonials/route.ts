import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — Public: fetch approved testimonials (🔄 Social Proof Loop)
// Admin: fetch all (approved + pending)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const approved = searchParams.get('approved');
  const isAdmin = searchParams.get('admin') === 'true';

  let query = supabaseAdmin
    .from('testimonials')
    .select('*, product:products(id, name, images)')
    .order('created_at', { ascending: false });

  // Public only sees approved testimonials
  if (!isAdmin || approved === 'true') {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

// POST — Admin: create/upload a testimonial
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { customer_name, customer_phone, photo_url, review_text, rating, product_id, is_approved } = body;

  if (!customer_name) {
    return Response.json({ error: 'Customer name is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({ customer_name, customer_phone, photo_url, review_text, rating, product_id, is_approved: is_approved ?? false })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return Response.json({ data }, { status: 201 });
}
