import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — list expenses with optional filters
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabaseAdmin
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (category && category !== 'all') query = query.eq('category', category);
  if (startDate) query = query.gte('expense_date', startDate);
  if (endDate) query = query.lte('expense_date', endDate);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data });
}

// POST — create new expense
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { title, amount, category, description, vendor, receipt_url, expense_date } = body;

  if (!title || !amount || !category) {
    return Response.json({ error: 'title, amount and category are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('expenses')
    .insert({ title, amount: parseFloat(amount), category, description, vendor, receipt_url, expense_date: expense_date || new Date().toISOString().slice(0, 10) })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
