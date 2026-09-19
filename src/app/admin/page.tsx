import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard | Admin' };
export const revalidate = 60;

async function getStats() {
  const [ordersToday, totalRevenue, totalProducts, lowStock, recentOrders, pendingOrders] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabaseAdmin.from('orders').select('total').neq('status', 'cancelled'),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active').lte('stock', 5).gt('stock', 0),
    supabaseAdmin.from('orders').select('*, customer:customers(name, phone)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'received'),
  ]);

  const revenue = (totalRevenue.data || []).reduce((s, o) => s + Number(o.total), 0);

  return {
    ordersToday: ordersToday.count || 0,
    revenue,
    totalProducts: totalProducts.count || 0,
    lowStock: lowStock.count || 0,
    recentOrders: recentOrders.data || [],
    pendingOrders: pendingOrders.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const STATUS_COLORS: Record<string, string> = {
    received: 'badge-received', confirmed: 'badge-confirmed',
    shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-md" id="admin-add-product">
          + Add New Saree
        </Link>
      </div>

      <div className="admin-content">
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰', color: 'var(--color-maroon)' },
            { label: 'Orders Today', value: stats.ordersToday, icon: '📦', color: 'var(--color-info)' },
            { label: 'Active Products', value: stats.totalProducts, icon: '🌸', color: 'var(--color-success)' },
            { label: 'Low Stock Alerts', value: stats.lowStock, icon: '⚠️', color: 'var(--color-warning)' },
          ].map(s => (
            <div key={s.label} className="stats-card" style={{ borderLeftColor: s.color }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">{s.icon}</div>
              <div className="stats-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stats-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Orders Alert */}
        {stats.pendingOrders > 0 && (
          <div style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--color-warning)' }}>⚠️ {stats.pendingOrders} orders awaiting confirmation</strong>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginTop: 4 }}>Review and confirm these orders to start the shipping process.</p>
            </div>
            <Link href="/admin/orders?status=received" className="btn btn-md" style={{ background: 'var(--color-warning)', color: 'white' }}>
              Review Orders →
            </Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="table-wrap">
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)' }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-maroon)' }}>View all →</Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: 'var(--space-10)' }}>No orders yet. Share your store to get your first order! 🌸</td></tr>
              ) : stats.recentOrders.map((order: { id: string; order_id: string; customer?: { name: string; phone: string }; total: number; status: string; created_at: string }) => (
                <tr key={order.id}>
                  <td><strong style={{ color: 'var(--color-maroon)' }}>{order.order_id}</strong></td>
                  <td>
                    <div>{order.customer?.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>{order.customer?.phone}</div>
                  </td>
                  <td><strong>₹{Number(order.total).toLocaleString('en-IN')}</strong></td>
                  <td><span className={`badge ${STATUS_COLORS[order.status] || 'badge-draft'}`}>{order.status}</span></td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <Link href={`/admin/orders?id=${order.id}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-maroon)' }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
          {[
            { href: '/admin/products/new', icon: '🌸', label: 'Add New Saree', desc: 'Upload product with photos & details' },
            { href: '/admin/testimonials', icon: '⭐', label: 'Review Testimonials', desc: 'Approve customer photos & reviews' },
            { href: '/admin/finance', icon: '📊', label: 'View Loop KPIs', desc: 'Track viral, coupon & restock loops' },
          ].map(q => (
            <Link key={q.href} href={q.href} className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }} aria-hidden="true">{q.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-1)' }}>{q.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
