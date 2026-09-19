import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST — 🔄 Viral Loop: increment share count for a product
export async function POST(_req: NextRequest, ctx: RouteContext<'/api/products/[id]/share'>) {
  const { id } = await ctx.params;

  const { error } = await supabaseAdmin.rpc('increment_share_count', { product_id: id });

  if (error) {
    // Fallback: manual increment if RPC not set up
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('share_count')
      .eq('id', id)
      .single();

    if (product) {
      await supabaseAdmin
        .from('products')
        .update({ share_count: (product.share_count || 0) + 1 })
        .eq('id', id);
    }
  }

  return Response.json({ success: true });
}
