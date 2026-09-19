import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — Admin: list customers with sorting, search, segmentation for 🔄 Re-engagement Loop
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'total_spent_desc';
  const city = searchParams.get('city');
  const minSpent = searchParams.get('minSpent');
  const notContactedDays = searchParams.get('notContactedDays'); // 🔄 Re-engagement filter
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 50;

  let query = supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // 🔄 Re-engagement Loop: filter by last contacted date
  if (notContactedDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(notContactedDays));
    query = query.or(
      `last_contacted_at.is.null,last_contacted_at.lt.${cutoffDate.toISOString()}`
    );
  }

  if (city) query = query.eq('city', city);
  if (minSpent) query = query.gte('total_spent', parseFloat(minSpent));

  const sortMap: Record<string, { col: string; asc: boolean }> = {
    total_spent_desc: { col: 'total_spent', asc: false },
    total_orders_desc: { col: 'total_orders', asc: false },
    name_asc: { col: 'name', asc: true },
    recent: { col: 'last_order_date', asc: false },
    last_contacted: { col: 'last_contacted_at', asc: true },
  };

  const { col, asc } = sortMap[sort] || sortMap.total_spent_desc;
  query = query.order(col, { ascending: asc, nullsFirst: asc });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data, total: count, page, pageSize });
}

// PATCH — Admin: update last_contacted_at (🔄 Re-engagement Loop)
export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { customer_ids } = await request.json();

  if (!customer_ids?.length) {
    return Response.json({ error: 'customer_ids required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('customers')
    .update({ last_contacted_at: new Date().toISOString() })
    .in('id', customer_ids);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true, updated: customer_ids.length });
}
