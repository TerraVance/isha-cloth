import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// PUT — Admin: update order status
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/orders/[id]'>) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;
  const body = await request.json();
  const { status, whatsapp_sent } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (whatsapp_sent !== undefined) updates.whatsapp_sent = whatsapp_sent;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select('*, customer:customers(*), items:order_items(*)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

// GET — Admin: get single order detail
export async function GET(request: NextRequest, ctx: RouteContext<'/api/orders/[id]'>) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, customer:customers(*), items:order_items(*), coupon:coupons(*)')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'Order not found' }, { status: 404 });
  return Response.json({ data });
}
