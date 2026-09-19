import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST — Customer signs up for restock notification
export async function POST(request: NextRequest) {
  try {
    const { product_id, phone } = await request.json();

    if (!product_id || !phone) {
      return NextResponse.json({ error: 'product_id and phone are required' }, { status: 400 });
    }

    // Validate Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    // Check product exists and is actually out of stock
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name, stock')
      .eq('id', product_id)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock > 0) {
      return NextResponse.json({ error: 'This product is currently in stock. You can add it to cart!' }, { status: 400 });
    }

    // Upsert — ignore if already exists (UNIQUE constraint)
    const { error } = await supabaseAdmin
      .from('restock_requests')
      .upsert({ product_id, phone }, { onConflict: 'product_id,phone', ignoreDuplicates: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to save notification request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `We'll WhatsApp you when "${product.name}" is back in stock! 🔔`,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET — Admin: list restock requests (grouped by product)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  const query = supabaseAdmin
    .from('restock_requests')
    .select('*, product:products(id, name, images, stock)')
    .eq('notified', false)
    .order('created_at', { ascending: false });

  if (productId) {
    query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
