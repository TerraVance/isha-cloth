import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// PUT — update manual revenue entry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { title, amount, payment_method, customer_name, customer_phone, description, items_summary, sale_date } = body;

  const { data, error } = await supabaseAdmin
    .from('manual_revenue')
    .update({
      title,
      amount: parseFloat(amount),
      payment_method,
      customer_name,
      customer_phone,
      description,
      items_summary,
      sale_date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

// DELETE — delete manual revenue entry
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('manual_revenue').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
