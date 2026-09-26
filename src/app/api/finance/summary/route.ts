import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString();
  const endDate = searchParams.get('endDate') || new Date().toISOString();

  const [ordersRes, expensesRes, businessInfoRes, manualRevRes] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('total, subtotal, discount_amount, shipping, created_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .neq('status', 'cancelled'),
    supabaseAdmin
      .from('expenses')
      .select('amount, category, expense_date')
      .gte('expense_date', startDate.slice(0, 10))
      .lte('expense_date', endDate.slice(0, 10)),
    supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'business_info')
      .single(),
    supabaseAdmin
      .from('manual_revenue')
      .select('amount, payment_method, sale_date')
      .gte('sale_date', startDate.slice(0, 10))
      .lte('sale_date', endDate.slice(0, 10)),
  ]);

  const orders = ordersRes.data || [];
  const expenses = expensesRes.data || [];
  const manualRevenues = manualRevRes.data || [];

  const onlineRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const offlineRevenue = manualRevenues.reduce((s, r) => s + Number(r.amount), 0);
  const totalRevenue = onlineRevenue + offlineRevenue;
  const totalDiscount = orders.reduce((s, o) => s + Number(o.discount_amount), 0);
  const totalShipping = orders.reduce((s, o) => s + Number(o.shipping), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Monthly breakdown
  const monthlyMap: Record<string, { revenue: number; offlineRevenue: number; expenses: number }> = {};
  orders.forEach(o => {
    const m = o.created_at.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, offlineRevenue: 0, expenses: 0 };
    monthlyMap[m].revenue += Number(o.total);
  });
  manualRevenues.forEach(r => {
    const m = r.sale_date.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, offlineRevenue: 0, expenses: 0 };
    monthlyMap[m].revenue += Number(r.amount);
    monthlyMap[m].offlineRevenue += Number(r.amount);
  });
  expenses.forEach(e => {
    const m = e.expense_date.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, offlineRevenue: 0, expenses: 0 };
    monthlyMap[m].expenses += Number(e.amount);
  });
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals, profit: vals.revenue - vals.expenses }));

  // Expense by category
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });

  // Manual revenue by payment method
  const byPaymentMethod: Record<string, number> = {};
  manualRevenues.forEach(r => {
    byPaymentMethod[r.payment_method] = (byPaymentMethod[r.payment_method] || 0) + Number(r.amount);
  });

  return Response.json({
    totalRevenue,
    onlineRevenue,
    offlineRevenue,
    totalDiscount,
    totalShipping,
    totalExpenses,
    netProfit,
    profitMargin,
    totalOrders: orders.length,
    avgOrderValue: orders.length ? Math.round(onlineRevenue / orders.length) : 0,
    monthly,
    byCategory,
    byPaymentMethod,
    businessInfo: businessInfoRes.data?.value || {},
  });
}
