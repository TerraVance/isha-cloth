import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — list invoices
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('invoices')
    .select('*, order:orders(order_id, created_at), customer:customers(name, phone, email, address, city, pincode)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

// POST — generate invoice from an order
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { order_id, gst_percent = 0, notes } = body;

  if (!order_id) return Response.json({ error: 'order_id is required' }, { status: 400 });

  // Check if invoice already exists for this order
  const { data: existing } = await supabaseAdmin
    .from('invoices')
    .select('id, invoice_number')
    .eq('order_id', order_id)
    .single();

  if (existing) return Response.json({ data: existing, already_exists: true });

  // Fetch the order
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, customer:customers(*)')
    .eq('id', order_id)
    .single();

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  // Generate invoice number
  const { count } = await supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact', head: true });

  const year = new Date().getFullYear();
  const seq = String((count || 0) + 1).padStart(3, '0');
  const invoice_number = `INV-${year}-${seq}`;

  const gstAmount = parseFloat(((order.subtotal - order.discount_amount) * (gst_percent / 100)).toFixed(2));

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      invoice_number,
      order_id,
      customer_id: order.customer_id,
      subtotal: order.subtotal,
      discount: order.discount_amount,
      shipping: order.shipping,
      gst_percent,
      gst_amount: gstAmount,
      total: order.total + gstAmount,
      notes,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
