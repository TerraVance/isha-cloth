import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json({ valid: false, reason: 'Code and subtotal are required' }, { status: 400 });
    }

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, reason: 'Invalid coupon code' });
    }

    // Check active
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, reason: 'This coupon is no longer active' });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'This coupon has expired' });
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, reason: 'This coupon has reached its usage limit' });
    }

    // Check minimum order
    if (subtotal < coupon.min_order) {
      return NextResponse.json({
        valid: false,
        reason: `Minimum order of ₹${coupon.min_order.toLocaleString('en-IN')} required for this coupon`,
      });
    }

    const discountAmount = parseFloat(((subtotal * coupon.discount_percent) / 100).toFixed(2));

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discountPercent: coupon.discount_percent,
      discountAmount,
      message: `🎉 ${coupon.discount_percent}% off applied! You save ₹${discountAmount.toLocaleString('en-IN')}`,
    });
  } catch {
    return NextResponse.json({ valid: false, reason: 'Server error. Please try again.' }, { status: 500 });
  }
}
