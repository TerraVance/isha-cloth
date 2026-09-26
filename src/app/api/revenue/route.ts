import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — list manual revenue entries
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const paymentMethod = searchParams.get('paymentMethod');

  let query = supabaseAdmin
    .from('manual_revenue')
    .select('*')
    .order('sale_date', { ascending: false });

  if (paymentMethod && paymentMethod !== 'all') query = query.eq('payment_method', paymentMethod);
  if (startDate) query = query.gte('sale_date', startDate);
  if (endDate) query = query.lte('sale_date', endDate);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

// POST — create new manual revenue entry
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { title, amount, payment_method, customer_name, customer_phone, description, items_summary, sale_date } = body;

  if (!title || !amount) {
    return Response.json({ error: 'title and amount are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('manual_revenue')
    .insert({
      title,
      amount: parseFloat(amount),
      payment_method: payment_method || 'cash',
      customer_name,
      customer_phone,
      description,
      items_summary,
      sale_date: sale_date || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
