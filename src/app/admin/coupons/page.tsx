'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  min_order: number;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const empty = {
  code: '',
  discount_percent: '10',
  min_order: '0',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(empty);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; coupon: Coupon | null; loading: boolean; error: string }>({
    open: false, coupon: null, loading: false, error: '',
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/coupons');
    const json = await res.json();
    setCoupons(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('Coupon code is required'); return; }
    if (!form.discount_percent || Number(form.discount_percent) < 1 || Number(form.discount_percent) > 100) {
      setError('Discount must be between 1% and 100%'); return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discount_percent: Number(form.discount_percent),
        min_order: Number(form.min_order || 0),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      }),
    });

    const json = await res.json();
    if (res.ok) {
      setSuccess(`Coupon "${json.data.code}" created!`);
      setForm(empty);
      fetchCoupons();
    } else {
      setError(json.error || 'Failed to create coupon');
    }
    setSaving(false);
  };

  const handleToggle = async (coupon: Coupon) => {
    const res = await fetch(`/api/coupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Failed to update coupon status.');
      return;
    }
    fetchCoupons();
  };

  const handleDelete = async (coupon: Coupon) => {
    setDeleteModal({ open: true, coupon, loading: false, error: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.coupon) return;
    setDeleteModal(m => ({ ...m, loading: true, error: '' }));
    const res = await fetch(`/api/coupons/${deleteModal.coupon.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg = res.status === 401
        ? 'Session expired. Please refresh and log in again.'
        : json.error || 'Failed to delete coupon. Please try again.';
      setDeleteModal(m => ({ ...m, loading: false, error: msg }));
      return;
    }
    setDeleteModal({ open: false, coupon: null, loading: false, error: '' });
    fetchCoupons();
  };

  const isExpired = (expires_at: string | null) =>
    expires_at ? new Date(expires_at) < new Date() : false;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
            🎟️ Coupon Codes
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)', marginTop: 4 }}>
            Create and manage discount codes for your customers.
          </p>
        </div>
      </div>

      <div className="admin-content">
        <style>{`
          .coupons-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: var(--space-8);
            align-items: start;
          }
        `}</style>
        <div className="coupons-layout">

          {/* ── TOP: Existing Coupons ── */}
          <div>
            <div className="card" style={{ padding: 'var(--space-7)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                All Coupons ({coupons.length})
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                  <span className="spinner dark" />
                </div>
              ) : coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎟️</div>
                  <p>No coupons yet. Create your first discount code!</p>
                </div>
              ) : (
                <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Code</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Discount</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Min Order</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Uses</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Expires</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Status</th>
                        <th style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: 'var(--space-3) var(--space-2)' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coupon => {
                        const expired = isExpired(coupon.expires_at);
                        const usedUp = coupon.max_uses !== null && coupon.times_used >= coupon.max_uses;
                        return (
                          <tr
                            key={coupon.id}
                            style={{
                              borderBottom: '1px solid var(--color-gray-100)',
                              opacity: (!coupon.is_active || expired || usedUp) ? 0.55 : 1,
                            }}
                          >
                            <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em', fontSize: 'var(--text-base)', color: 'var(--color-maroon)' }}>
                                {coupon.code}
                              </span>
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                              <span style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                                {coupon.discount_percent}% OFF
                              </span>
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--color-gray-600)' }}>
                              {coupon.min_order > 0 ? `₹${coupon.min_order.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)', color: usedUp ? 'var(--color-error)' : 'var(--color-gray-600)' }}>
                              {coupon.times_used}{coupon.max_uses !== null ? `/${coupon.max_uses}` : '/∞'}
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)', color: expired ? 'var(--color-error)' : 'var(--color-gray-600)', fontSize: 'var(--text-xs)' }}>
                              {coupon.expires_at
                                ? new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                                : '—'}
                              {expired && ' (expired)'}
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                              <button
                                onClick={() => handleToggle(coupon)}
                                className={`badge ${coupon.is_active && !expired && !usedUp ? 'badge-active' : 'badge-draft'}`}
                                style={{ cursor: 'pointer', border: 'none', fontSize: 'var(--text-xs)' }}
                                aria-label={coupon.is_active ? 'Deactivate coupon' : 'Activate coupon'}
                              >
                                {coupon.is_active && !expired && !usedUp ? 'Active' : expired ? 'Expired' : usedUp ? 'Used Up' : 'Inactive'}
                              </button>
                            </td>
                            <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                              <button
                                onClick={() => handleDelete(coupon)}
                                className="btn btn-sm"
                                style={{ color: 'var(--color-error)', padding: 'var(--space-1) var(--space-2)' }}
                                aria-label={`Delete ${coupon.code}`}
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


          {/* ── BOTTOM: Create Coupon ── */}
          <div>
            <div className="card" style={{ padding: 'var(--space-7)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                Create New Coupon
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Code */}
                <div className="input-group">
                  <label className="input-label" htmlFor="coupon-code">Coupon Code *</label>
                  <input
                    id="coupon-code"
                    className="input"
                    placeholder="e.g. SAVE20, DIWALI10"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}
                    maxLength={30}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>
                    Will be auto-uppercased. Customers enter this code exactly.
                  </span>
                </div>

                {/* Discount % */}
                <div className="input-group">
                  <label className="input-label" htmlFor="discount-pct">Discount Percentage *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <input
                      id="discount-pct"
                      type="range"
                      min="1" max="100"
                      value={form.discount_percent}
                      onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                      style={{ flex: 1, accentColor: 'var(--color-maroon)' }}
                    />
                    <div style={{
                      minWidth: 64, textAlign: 'center',
                      background: 'var(--color-maroon)', color: 'white',
                      fontWeight: 700, fontSize: 'var(--text-lg)',
                      borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                    }}>
                      {form.discount_percent}%
                    </div>
                  </div>
                  <input
                    type="number" min="1" max="100"
                    className="input"
                    value={form.discount_percent}
                    onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                    style={{ marginTop: 'var(--space-2)' }}
                    placeholder="Or type a value"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  {/* Min Order */}
                  <div className="input-group">
                    <label className="input-label" htmlFor="min-order">Minimum Order (₹)</label>
                    <input
                      id="min-order"
                      type="number" min="0"
                      className="input"
                      placeholder="0 = no minimum"
                      value={form.min_order}
                      onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                    />
                  </div>

                  {/* Max Uses */}
                  <div className="input-group">
                    <label className="input-label" htmlFor="max-uses">Max Uses</label>
                    <input
                      id="max-uses"
                      type="number" min="1"
                      className="input"
                      placeholder="Leave blank = unlimited"
                      value={form.max_uses}
                      onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Expires At */}
                <div className="input-group">
                  <label className="input-label" htmlFor="expires-at">Expiry Date</label>
                  <input
                    id="expires-at"
                    type="datetime-local"
                    className="input"
                    value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>
                    Leave blank = never expires
                  </span>
                </div>

                {/* Active Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Active</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>Inactive coupons are silently rejected</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 24,
                      background: form.is_active ? 'var(--color-success)' : 'var(--color-gray-300)',
                      transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute', left: form.is_active ? 22 : 2, top: 2,
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </span>
                  </label>
                </div>

                {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{error}</p>}
                {success && <p style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)' }}>✅ {success}</p>}

                <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ justifyContent: 'center' }}>
                  {saving ? <><span className="spinner" /> Creating…</> : '✅ Create Coupon'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        title="Delete Coupon"
        message="Are you sure you want to permanently delete this coupon? Customers will no longer be able to use this code."
        itemName={deleteModal.coupon?.code}
        isDeleting={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, coupon: null, loading: false, error: '' })}
      />
    </div>
  );
}
