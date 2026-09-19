'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { whatsapp, buildOrderStatusMessage } from '@/lib/whatsapp';

const STATUS_OPTIONS = ['received', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE: Record<string, string> = {
  received: 'badge-received', confirmed: 'badge-confirmed',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

interface Order {
  id: string; order_id: string; status: string; total: number;
  discount_amount: number; coupon?: { code: string };
  whatsapp_sent: boolean; created_at: string;
  customer?: { name: string; phone: string; city: string };
  items?: { name: string; quantity: number; price: number }[];
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const customerName = searchParams.get('customerName');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (customerId) params.set('customerId', customerId);
    const res = await fetch(`/api/orders?${params}`);
    const json = await res.json();
    setOrders(json.data || []);
    setLoading(false);
  }, [statusFilter, startDate, endDate, customerId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    setUpdating(order.id);
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    // Open WhatsApp to notify customer
    if (order.customer?.phone && newStatus !== 'cancelled') {
      const msg = buildOrderStatusMessage({
        customerName: order.customer.name,
        orderId: order.order_id,
        status: newStatus,
      });
      window.open(whatsapp.toCustomer(order.customer.phone, msg), '_blank');
    }
    fetchOrders();
    setUpdating(null);
  };

  const handleMarkWhatsApp = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_sent: true }),
    });
    fetchOrders();
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
          Orders {orders.length > 0 && <span style={{ color: 'var(--color-gray-400)', fontWeight: 400, fontSize: 'var(--text-lg)' }}>({orders.length})</span>}
        </h1>
        
        {/* Date Range Filter (B9) */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', background: 'white', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-300)' }}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)' }} aria-label="Start Date" />
          <span style={{ color: 'var(--color-gray-400)' }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)' }} aria-label="End Date" />
        </div>
      </div>

      <div className="admin-content">
        {/* C9: Customer filter banner */}
        {customerId && customerName && (
          <div style={{ background: 'rgba(128,0,32,0.06)', border: '1px solid rgba(128,0,32,0.15)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-5)', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>
              📦 Showing orders for: <em style={{ fontStyle: 'normal', color: 'var(--color-maroon)' }}>{decodeURIComponent(customerName)}</em>
            </span>
            <a href="/admin/orders" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-gray-500)' }}>
              ✕ Clear Filter
            </a>
          </div>
        )}

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['', ...STATUS_OPTIONS].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`category-pill${statusFilter === s ? ' active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s || 'All Orders'}
            </button>
          ))}

        </div>

        {/* Order Status Donut Chart (B8) */}
        {!loading && orders.length > 0 && (
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(
              var(--color-warning) 0% ${orders.filter(o => o.status === 'received').length / orders.length * 100}%,
              var(--color-info) ${orders.filter(o => o.status === 'received').length / orders.length * 100}% ${(orders.filter(o => o.status === 'received' || o.status === 'confirmed').length / orders.length) * 100}%,
              var(--color-success) ${(orders.filter(o => o.status === 'received' || o.status === 'confirmed').length / orders.length) * 100}% ${(orders.filter(o => o.status !== 'cancelled').length / orders.length) * 100}%,
              var(--color-error) ${(orders.filter(o => o.status !== 'cancelled').length / orders.length) * 100}% 100%
            )` }}>
              <div style={{ position: 'absolute', inset: 20, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)' }}>
                {orders.length}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-warning)' }}/> Received ({orders.filter(o => o.status === 'received').length})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-info)' }}/> Confirmed ({orders.filter(o => o.status === 'confirmed').length})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-success)' }}/> Shipped/Delivered ({orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-error)' }}/> Cancelled ({orders.filter(o => o.status === 'cancelled').length})</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}><span className="spinner dark" style={{ width: 32, height: 32 }} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-gray-400)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</div>
            <p>No orders {statusFilter ? `with status "${statusFilter}"` : 'yet'}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card">
                {/* Header row */}
                <div
                  className="order-card-header"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="order-card-left">
                    <strong style={{ color: 'var(--color-maroon)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
                      {order.order_id}
                    </strong>
                    <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                    {!order.whatsapp_sent && (
                      <span className="badge badge-draft" style={{ fontSize: 10 }}>⚠ WA Pending</span>
                    )}
                    {order.coupon && (
                      <span className="badge badge-confirmed" style={{ fontSize: 10 }}>🎟️ {order.coupon.code}</span>
                    )}
                  </div>
                  <div className="order-card-right">
                    <span style={{ fontWeight: 700, color: 'var(--color-charcoal)' }}>₹{Number(order.total).toLocaleString('en-IN')}</span>
                    {order.discount_amount > 0 && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>
                        (−₹{Number(order.discount_amount).toLocaleString('en-IN')})
                      </span>
                    )}
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>{expanded === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === order.id && (
                  <div className="order-card-detail">
                    <div className="order-detail-grid">
                      {/* Customer Info */}
                      <div>
                        <p className="order-detail-label">Customer</p>
                        <p style={{ fontWeight: 600 }}>{order.customer?.name}</p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>📱 {order.customer?.phone}</p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>📍 {order.customer?.city}</p>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="order-detail-label">Items Ordered</p>
                        {order.items?.map((item, i) => (
                          <p key={i} style={{ fontSize: 'var(--text-sm)' }}>
                            {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="order-actions">
                      {/* Status updater */}
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {STATUS_OPTIONS.filter(s => s !== order.status).map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(order, s)}
                            className="btn btn-sm btn-outline"
                            style={{ textTransform: 'capitalize' }}
                            disabled={updating === order.id}
                          >
                            → {s}
                          </button>
                        ))}
                      </div>

                      {/* WhatsApp buttons */}
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {order.customer?.phone && (
                          <a
                            href={whatsapp.toCustomer(order.customer.phone, buildOrderStatusMessage({ customerName: order.customer.name, orderId: order.order_id, status: order.status }))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            onClick={() => handleMarkWhatsApp(order.id)}
                            id={`wa-customer-${order.id}`}
                          >
                            📱 Message Customer
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .category-pill {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: 500;
          border: 1.5px solid var(--color-gray-300);
          background: white; color: var(--color-gray-600);
          cursor: pointer; transition: all var(--transition-fast);
        }
        .category-pill.active { background: var(--color-maroon); border-color: var(--color-maroon); color: white; }
        .category-pill:hover:not(.active) { border-color: var(--color-maroon); color: var(--color-maroon); }

        .order-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-100);
          overflow: hidden;
          transition: box-shadow var(--transition-fast);
        }
        .order-card:hover { box-shadow: var(--shadow-md); }

        .order-card-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--space-5) var(--space-6);
          flex-wrap: wrap; gap: var(--space-3);
        }

        .order-card-left, .order-card-right {
          display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;
        }

        .order-card-detail {
          border-top: 1px solid var(--color-gray-100);
          padding: var(--space-5) var(--space-6);
          background: var(--color-gray-50);
          animation: fadeIn 0.2s ease;
        }

        .order-detail-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: var(--space-6); margin-bottom: var(--space-5);
        }
        @media (max-width: 600px) { .order-detail-grid { grid-template-columns: 1fr; } }

        .order-detail-label {
          font-size: var(--text-xs); text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--color-gray-400);
          font-weight: 600; margin-bottom: var(--space-2);
        }

        .order-actions {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-gray-200);
        }
      `}</style>
    </div>
  );
}
