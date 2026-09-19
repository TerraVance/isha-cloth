'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  whatsapp, buildNewCollectionMessage, buildReviewRequestMessage
} from '@/lib/whatsapp';

interface Customer {
  id: string; name: string; phone: string; email: string | null;
  city: string | null; total_orders: number; total_spent: number;
  last_order_date: string | null; last_contacted_at: string | null;
}

const BROADCAST_TEMPLATES = [
  { key: 'newCollection', label: '🆕 New Collection Announcement', needsParam: true, paramLabel: 'Collection Name', paramPlaceholder: 'e.g., Festive 2026' },
  { key: 'reviewRequest', label: '📸 Request Customer Photo/Review', needsParam: false, paramLabel: '', paramPlaceholder: '' },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('total_spent_desc');
  const [notContactedDays, setNotContactedDays] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [broadcastTemplate, setBroadcastTemplate] = useState('newCollection');
  const [broadcastParam, setBroadcastParam] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastDone, setBroadcastDone] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort: sortBy, pageSize: '100' });
    if (search) params.set('search', search);
    if (notContactedDays) params.set('notContactedDays', notContactedDays);
    const res = await fetch(`/api/customers?${params}`);
    const json = await res.json();
    setCustomers(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [search, sortBy, notContactedDays]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(customers.map(c => c.id)));
  const clearSelection = () => setSelected(new Set());

  const buildMessage = (customer: Customer): string => {
    if (broadcastTemplate === 'newCollection') {
      return buildNewCollectionMessage({ customerName: customer.name, collectionName: broadcastParam || 'New Arrivals' });
    }
    return buildReviewRequestMessage(customer.name);
  };

  // 🔄 Re-engagement Loop: Sequential WhatsApp broadcast
  const handleBroadcast = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Send WhatsApp message to ${selected.size} customer${selected.size > 1 ? 's' : ''}? Each message will open in a new tab.`)) return;

    setBroadcasting(true);
    setBroadcastProgress(0);
    setBroadcastDone(false);

    const selectedCustomers = customers.filter(c => selected.has(c.id));
    let i = 0;

    for (const customer of selectedCustomers) {
      const message = buildMessage(customer);
      const url = whatsapp.toCustomer(customer.phone, message);
      window.open(url, '_blank');
      i++;
      setBroadcastProgress(Math.round((i / selectedCustomers.length) * 100));
      await new Promise(r => setTimeout(r, 800)); // small delay between tabs
    }

    // Mark as contacted
    await fetch('/api/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_ids: Array.from(selected) }),
    });

    setBroadcasting(false);
    setBroadcastDone(true);
    clearSelection();
    fetchCustomers();
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    
    // CSV Header
    const headers = ['Name', 'Phone', 'City', 'Total Orders', 'Total Spent', 'Last Order', 'Last Contacted'];
    
    // CSV Rows
    const rows = customers.map(c => [
      `"${c.name}"`,
      `="${c.phone}"`, // Force Excel to treat as string so it doesn't drop leading zeros
      `"${c.city || ''}"`,
      c.total_orders,
      c.total_spent,
      c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN') : '',
      c.last_contacted_at ? new Date(c.last_contacted_at).toLocaleDateString('en-IN') : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const template = BROADCAST_TEMPLATES.find(t => t.key === broadcastTemplate)!;

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
          Customers <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-400)', fontWeight: 400 }}>({total})</span>
        </h1>
        <button onClick={handleExportCSV} disabled={customers.length === 0} className="btn btn-outline btn-sm">
          📥 Export CSV
        </button>
      </div>

      <div className="admin-content">
        {/* 🔄 Re-engagement Loop: Broadcast Panel */}
        <div className="card broadcast-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-maroon)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
            📢 🔄 Re-engagement Loop — WhatsApp Broadcast
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--space-4)', alignItems: 'end' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="broadcast-template">Message Template</label>
              <select id="broadcast-template" className="input" value={broadcastTemplate} onChange={e => setBroadcastTemplate(e.target.value)}>
                {BROADCAST_TEMPLATES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            {template.needsParam && (
              <div className="input-group">
                <label className="input-label" htmlFor="broadcast-param">{template.paramLabel}</label>
                <input id="broadcast-param" className="input" placeholder={template.paramPlaceholder} value={broadcastParam} onChange={e => setBroadcastParam(e.target.value)} />
              </div>
            )}

            <button
              onClick={handleBroadcast}
              disabled={selected.size === 0 || broadcasting}
              className="btn btn-whatsapp btn-md"
              id="broadcast-btn"
            >
              {broadcasting
                ? `Sending… ${broadcastProgress}%`
                : `📤 Send to ${selected.size || '—'} Selected`}
            </button>
          </div>

          {broadcastDone && (
            <div style={{ marginTop: 'var(--space-4)', background: 'var(--color-success-light)', color: 'var(--color-success)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              ✅ Broadcast complete! Last contacted date updated for all selected customers.
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ maxWidth: 260 }}>
            <input type="search" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} className="input" id="customer-search" />
          </div>
          <div className="input-group" style={{ maxWidth: 200 }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input">
              <option value="total_spent_desc">Top Spenders</option>
              <option value="total_orders_desc">Most Orders</option>
              <option value="recent">Most Recent</option>
              <option value="last_contacted">Not Contacted Recently</option>
            </select>
          </div>
          <div className="input-group" style={{ maxWidth: 220 }}>
            <select value={notContactedDays} onChange={e => setNotContactedDays(e.target.value)} className="input" id="not-contacted-filter">
              <option value="">All customers</option>
              <option value="7">Not contacted in 7+ days</option>
              <option value="30">Not contacted in 30+ days</option>
              <option value="60">Not contacted in 60+ days</option>
              <option value="90">Not contacted in 90+ days</option>
            </select>
          </div>
        </div>

        {/* Select All / Clear */}
        {customers.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
            <button onClick={selectAll} className="btn btn-ghost btn-sm" id="select-all-customers">Select All ({customers.length})</button>
            {selected.size > 0 && <button onClick={clearSelection} className="btn btn-ghost btn-sm">Clear ({selected.size})</button>}
            {selected.size > 0 && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-maroon)', fontWeight: 600 }}>{selected.size} selected for broadcast</span>}
          </div>
        )}

        {/* Customer Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Customer</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Last Contacted</th>
                <th>WhatsApp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)' }}><span className="spinner dark" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>No customers found.</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} style={{ background: selected.has(c.id) ? 'rgba(128,0,32,0.04)' : undefined }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                      aria-label={`Select ${c.name}`}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>📱 {c.phone}</div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>{c.city || '—'}</td>
                  <td style={{ fontWeight: 600, textAlign: 'center' }}>{c.total_orders}</td>
                  <td><strong style={{ color: 'var(--color-maroon)' }}>₹{Number(c.total_spent).toLocaleString('en-IN')}</strong></td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: c.last_contacted_at ? 'var(--color-gray-500)' : 'var(--color-warning)', fontWeight: c.last_contacted_at ? 400 : 600 }}>
                    {c.last_contacted_at ? new Date(c.last_contacted_at).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/${c.phone}?text=${encodeURIComponent(`Hi ${c.name}! 🌸`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ padding: '4px 10px' }}
                    >
                      💬
                    </a>
                  </td>
                  <td>
                    <a
                      href={`/admin/orders?customerId=${c.id}&customerName=${encodeURIComponent(c.name)}`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 'var(--text-xs)' }}
                      title={`View orders for ${c.name}`}
                    >
                      📦 View Orders
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
