import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { CartItem } from '@/types/database';

// POST — Public: place a new order (full loop-engineered flow)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address, city, pincode, items, coupon_code } = body;

    // --- 1. Validate required fields ---
    if (!name || !phone || !address || !city || !pincode || !items?.length) {
      return Response.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    // --- 2. Validate stock for each item ---
    for (const item of items as CartItem[]) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('id, name, stock')
        .eq('id', item.productId)
        .single();

      if (!product || product.stock < item.quantity) {
        return Response.json({
          error: `"${item.name}" is ${!product ? 'unavailable' : 'out of stock'}. Please update your cart.`,
        }, { status: 400 });
      }
    }

    // --- 3. 🔄 Post-Purchase Loop: Validate coupon if provided ---
    let couponId: string | null = null;
    let discountAmount = 0;
    const subtotal = (items as CartItem[]).reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const notMaxed = coupon.max_uses === null || coupon.times_used < coupon.max_uses;
        const meetsMin = subtotal >= coupon.min_order;

        if (notExpired && notMaxed && meetsMin) {
          couponId = coupon.id;
          discountAmount = parseFloat(((subtotal * coupon.discount_percent) / 100).toFixed(2));
        }
      }
    }

    // --- 4. Upsert customer ---
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .upsert({ name, phone, email, address, city, pincode }, { onConflict: 'phone' })
      .select()
      .single();

    if (!customer) return Response.json({ error: 'Failed to save customer' }, { status: 500 });

    // --- 5. Generate human-readable order ID ---
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });
    const seq = String((count || 0) + 1).padStart(3, '0');
    const orderId = `IV-${dateStr}-${seq}`;

    // --- 6. Calculate shipping ---
    const shipping = subtotal - discountAmount >= 999 ? 0 : 99;
    const total = subtotal - discountAmount + shipping;

    // --- 7. Create order ---
    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderId,
        customer_id: customer.id,
        coupon_id: couponId,
        subtotal,
        discount_amount: discountAmount,
        shipping,
        total,
        status: 'received',
      })
      .select()
      .single();

    if (!order) return Response.json({ error: 'Failed to create order' }, { status: 500 });

    // --- 8. Create order items ---
    const orderItems = (items as CartItem[]).map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));
    await supabaseAdmin.from('order_items').insert(orderItems);

    // --- 9. Decrement stock, increment sold ---
    for (const item of items as CartItem[]) {
      await supabaseAdmin.rpc('decrement_stock', {
        p_id: item.productId,
        qty: item.quantity,
      }).then(async () => {
        // fallback if RPC doesn't exist
      });

      const { data: p } = await supabaseAdmin
        .from('products')
        .select('stock, sold')
        .eq('id', item.productId)
        .single();

      if (p) {
        await supabaseAdmin
          .from('products')
          .update({ stock: Math.max(0, p.stock - item.quantity), sold: p.sold + item.quantity })
          .eq('id', item.productId);
      }
    }

    // --- 10. 🔄 Post-Purchase Loop: Increment coupon usage ---
    if (couponId) {
      const { data: c } = await supabaseAdmin
        .from('coupons')
        .select('times_used')
        .eq('id', couponId)
        .single();
      if (c) {
        await supabaseAdmin
          .from('coupons')
          .update({ times_used: c.times_used + 1 })
          .eq('id', couponId);
      }
    }

    // --- 11. Update customer stats ---
    const { data: updatedCustomer } = await supabaseAdmin
      .from('customers')
      .select('total_orders, total_spent')
      .eq('id', customer.id)
      .single();

    if (updatedCustomer) {
      await supabaseAdmin
        .from('customers')
        .update({
          total_orders: updatedCustomer.total_orders + 1,
          total_spent: updatedCustomer.total_spent + total,
          last_order_date: new Date().toISOString(),
        })
        .eq('id', customer.id);
    }

    return Response.json({
      success: true,
      orderId,
      total,
      discountAmount,
      couponCode: 'ISHA10', // 🔄 Post-Purchase Loop: always share next coupon
    }, { status: 201 });

  } catch (err) {
    console.error('Order error:', err);
    return Response.json({ error: 'Failed to place order. Please try again.' }, { status: 500 });
  }
}

// GET — Admin only: list all orders with customer + items
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const customerId = searchParams.get('customerId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 20;

  let query = supabaseAdmin
    .from('orders')
    .select('*, customer:customers(*), items:order_items(*), coupon:coupons(code,discount_percent)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq('status', status);
  if (customerId) query = query.eq('customer_id', customerId);
  
  if (startDate) {
    query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
  }

  const { data, error, count } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data, total: count, page, pageSize });
}
