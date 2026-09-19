import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — Public: list active products with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const exclude = searchParams.get('exclude');
  const sort = searchParams.get('sort') || 'created_at_desc';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const status = searchParams.get('status') || 'active';

  // Admin can view all statuses; public only sees active
  const isAdminRequest = searchParams.get('admin') === 'true';

  let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

  if (!isAdminRequest) query = query.eq('status', 'active');
  else if (status !== 'all') query = query.eq('status', status);

  if (category) query = query.eq('category', category);
  if (featured === 'true') query = query.eq('featured', true);
  if (minPrice) query = query.gte('price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
  if (exclude) query = query.neq('id', exclude);

  // Sorting
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    created_at_desc: { col: 'created_at', asc: false },
    price_asc: { col: 'price', asc: true },
    price_desc: { col: 'price', asc: false },
    name_asc: { col: 'name', asc: true },
    popular: { col: 'sold', asc: false },
    share_count: { col: 'share_count', asc: false }, // 🔄 Viral Loop
  };
  const { col, asc } = sortMap[sort] || sortMap.created_at_desc;
  query = query.order(col, { ascending: asc });

  // Pagination
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data, total: count, page, pageSize });
}

// POST — Admin only: create product
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(body)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ data }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
