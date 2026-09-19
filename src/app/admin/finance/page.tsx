import { supabaseAdmin } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Finance & Loop KPIs | Admin' };
export const revalidate = 120;

async function getFinanceData() {
  const [
    allOrders, coupons, testimonials, restockRequests,
    topShared, customers, inventoryData
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('total, discount_amount, coupon_id, status, created_at').neq('status', 'cancelled'),
    supabaseAdmin.from('coupons').select('*'),
    supabaseAdmin.from('testimonials').select('is_approved'),
    supabaseAdmin.from('restock_requests').select('*'),
    supabaseAdmin.from('products').select('id, name, share_count').order('share_count', { ascending: false }).limit(5),
    supabaseAdmin.from('customers').select('total_orders, last_contacted_at'),
    supabaseAdmin.from('products').select('name, sold, stock, price'),
  ]);

  const orders = allOrders.data || [];
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalDiscount = orders.reduce((s, o) => s + Number(o.discount_amount || 0), 0);
  const couponOrders = orders.filter(o => o.coupon_id).length;

  const custData = customers.data || [];
  const repeatCustomers = custData.filter(c => c.total_orders > 1).length;
  const repeatRate = custData.length ? Math.round((repeatCustomers / custData.length) * 100) : 0;

  const testimonialsData = testimonials.data || [];
  const restockData = restockRequests.data || [];

  // Monthly revenue for chart
  const byMonth: Record<string, number> = {};
  orders.forEach(o => {
    const month = o.created_at.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + Number(o.total);
  });
  const monthlyRevenue = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, rev]) => ({ month, rev }));

  // Inventory Calculations (B6 & B7)
  const productsList = inventoryData.data || [];
  const totalItemsSold = productsList.reduce((s, p) => s + (p.sold || 0), 0);
  const totalStockLeft = productsList.reduce((s, p) => s + (p.stock || 0), 0);
  const totalStockValue = productsList.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

  return {
    totalRevenue,
    totalDiscount,
    totalOrders: orders.length,
    couponOrders,
    couponRedemptionRate: orders.length ? Math.round((couponOrders / orders.length) * 100) : 0,
    totalShares: (topShared.data || []).reduce((s, p) => s + (p.share_count || 0), 0),
    topShared: topShared.data || [],
    reviewsTotal: testimonialsData.length,
    reviewsApproved: testimonialsData.filter(t => t.is_approved).length,
    reviewsPending: testimonialsData.filter(t => !t.is_approved).length,
    restockActive: restockData.filter(r => !r.notified).length,
    restockNotified: restockData.filter(r => r.notified).length,
    customersContacted: custData.filter(c => c.last_contacted_at).length,
    repeatRate,
    monthlyRevenue,
    coupons: coupons.data || [],
    inventory: { totalItemsSold, totalStockLeft, totalStockValue },
  };
}

export default async function FinancePage() {
  const d = await getFinanceData();

  const maxRev = Math.max(...d.monthlyRevenue.map(m => m.rev), 1);

  return (
    <div>
      <div className="admin-header">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
          Finance & 🔄 Loop KPIs
        </h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Refreshes every 2 minutes</span>
      </div>

      <div className="admin-content">

        {/* Revenue Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Revenue', value: `₹${d.totalRevenue.toLocaleString('en-IN')}`, color: 'var(--color-maroon)', icon: '💰' },
            { label: 'Total Orders', value: d.totalOrders, color: 'var(--color-info)', icon: '📦' },
            { label: 'Avg Order Value', value: `₹${d.totalOrders ? Math.round(d.totalRevenue / d.totalOrders).toLocaleString('en-IN') : 0}`, color: 'var(--color-success)', icon: '📈' },
            { label: 'Repeat Customer %', value: `${d.repeatRate}%`, color: 'var(--color-warning)', icon: '🔄' },
          ].map(s => (
            <div key={s.label} className="stats-card" style={{ borderLeftColor: s.color }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">{s.icon}</div>
              <div className="stats-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stats-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Inventory Summary (B6 & B7) */}
        <div className="card" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)', borderTop: '4px solid #4B5563' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
            📦 Inventory Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-1)' }}>Total Items Sold</div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: '#4B5563' }}>{d.inventory.totalItemsSold.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-1)' }}>Total Stock Left</div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-success)' }}>{d.inventory.totalStockLeft.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-1)' }}>Total Stock Value (Est)</div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-gold-dark)' }}>₹{d.inventory.totalStockValue.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        {d.monthlyRevenue.length > 0 && (
          <div className="card" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-6)' }}>
              Monthly Revenue
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)', height: 160 }}>
              {d.monthlyRevenue.map(({ month, rev }) => (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-maroon)' }}>
                    ₹{rev >= 1000 ? `${(rev / 1000).toFixed(1)}k` : rev}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      background: 'linear-gradient(to top, var(--color-maroon), var(--color-maroon-light))',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      height: `${Math.round((rev / maxRev) * 120)}px`,
                      minHeight: 4,
                      transition: 'height 0.8s ease',
                    }}
                  />
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                    {new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔄 LOOP ENGINEERING KPIs */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-6)' }}>
          🔄 Loop Engineering KPIs
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>

          {/* Viral Loop */}
          <div className="card loop-kpi-card" style={{ padding: 'var(--space-7)', borderTop: '4px solid var(--color-maroon)' }}>
            <h3 className="loop-kpi-title">🔄 Viral Loop — WhatsApp Shares</h3>
            <div className="loop-kpi-big">📤 {d.totalShares.toLocaleString('en-IN')}</div>
            <p className="loop-kpi-desc">Total product share clicks across all sarees</p>
            <div className="loop-kpi-list">
              {d.topShared.map(p => (
                <div key={p.id} className="loop-kpi-row">
                  <span>{p.name}</span>
                  <strong style={{ color: 'var(--color-maroon)' }}>📤 {p.share_count}</strong>
                </div>
              ))}
              {d.topShared.length === 0 && <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>No shares yet — encourage customers to share!</p>}
            </div>
          </div>

          {/* Post-Purchase Loop */}
          <div className="card loop-kpi-card" style={{ padding: 'var(--space-7)', borderTop: '4px solid var(--color-gold)' }}>
            <h3 className="loop-kpi-title">🎟️ Post-Purchase Loop — Coupons</h3>
            <div className="loop-kpi-big" style={{ color: 'var(--color-gold-dark)' }}>{d.couponRedemptionRate}%</div>
            <p className="loop-kpi-desc">Coupon redemption rate ({d.couponOrders} of {d.totalOrders} orders)</p>
            <div className="loop-kpi-list">
              <div className="loop-kpi-row">
                <span>Total Discount Given</span>
                <strong>₹{d.totalDiscount.toLocaleString('en-IN')}</strong>
              </div>
              {d.coupons.map((c: { id: string; code: string; times_used: number; discount_percent: number; is_active: boolean }) => (
                <div key={c.id} className="loop-kpi-row">
                  <span>{c.code} ({c.discount_percent}% off)</span>
                  <strong style={{ color: c.is_active ? 'var(--color-success)' : 'var(--color-gray-400)' }}>
                    {c.times_used} uses {!c.is_active && '(inactive)'}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Loop */}
          <div className="card loop-kpi-card" style={{ padding: 'var(--space-7)', borderTop: '4px solid var(--color-info)' }}>
            <h3 className="loop-kpi-title">⭐ Social Proof Loop — Reviews</h3>
            <div className="loop-kpi-big" style={{ color: 'var(--color-info)' }}>{d.reviewsApproved}</div>
            <p className="loop-kpi-desc">Approved reviews showing on homepage</p>
            <div className="loop-kpi-list">
              <div className="loop-kpi-row">
                <span>Pending Approval</span>
                <strong style={{ color: 'var(--color-warning)' }}>{d.reviewsPending}</strong>
              </div>
              <div className="loop-kpi-row">
                <span>Total Collected</span>
                <strong>{d.reviewsTotal}</strong>
              </div>
            </div>
            {d.reviewsPending > 0 && (
              <a href="/admin/testimonials" className="btn btn-sm" style={{ marginTop: 'var(--space-4)', background: 'var(--color-info)', color: 'white', justifyContent: 'center', display: 'flex' }}>
                Review {d.reviewsPending} Pending →
              </a>
            )}
          </div>

          {/* Restock + Re-engagement Loop */}
          <div className="card loop-kpi-card" style={{ padding: 'var(--space-7)', borderTop: '4px solid var(--color-success)' }}>
            <h3 className="loop-kpi-title">🔔 Restock + Re-engagement Loops</h3>
            <div className="loop-kpi-big" style={{ color: 'var(--color-success)' }}>{d.restockActive}</div>
            <p className="loop-kpi-desc">Customers waiting for restock notification</p>
            <div className="loop-kpi-list">
              <div className="loop-kpi-row">
                <span>Already Notified</span>
                <strong style={{ color: 'var(--color-gray-400)' }}>{d.restockNotified}</strong>
              </div>
              <div className="loop-kpi-row">
                <span>Customers Broadcast To</span>
                <strong>{d.customersContacted}</strong>
              </div>
              <div className="loop-kpi-row">
                <span>Repeat Purchase Rate</span>
                <strong style={{ color: 'var(--color-success)' }}>{d.repeatRate}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .loop-kpi-card { transition: transform var(--transition-normal), box-shadow var(--transition-normal); }
        .loop-kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

        .loop-kpi-title {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          color: var(--color-burgundy);
          margin-bottom: var(--space-3);
        }

        .loop-kpi-big {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          font-weight: 700;
          color: var(--color-maroon);
          line-height: 1;
          margin-bottom: var(--space-2);
        }

        .loop-kpi-desc {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-gray-100);
        }

        .loop-kpi-list { display: flex; flex-direction: column; gap: var(--space-3); }

        .loop-kpi-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--color-gray-600);
        }
      `}</style>
    </div>
  );
}
