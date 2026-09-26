'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────
type Expense = {
  id: string; title: string; amount: number; category: string;
  description?: string; vendor?: string; receipt_url?: string; expense_date: string;
};
type ManualRevenue = {
  id: string; title: string; amount: number; payment_method: string;
  customer_name?: string; customer_phone?: string; description?: string;
  items_summary?: string; sale_date: string;
};
type Invoice = {
  id: string; invoice_number: string; status: string; total: number;
  subtotal: number; discount: number; shipping: number; gst_percent: number; gst_amount: number;
  created_at: string; notes?: string;
  order: { order_id: string; created_at: string };
  customer: { name: string; phone: string; email?: string; address?: string; city?: string; pincode?: string };
};
type OrderRow = {
  id: string; order_id: string; total: number; subtotal: number; discount_amount: number;
  shipping: number; status: string; created_at: string; notes?: string;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number; price: number }[];
};
type Summary = {
  totalRevenue: number; onlineRevenue: number; offlineRevenue: number;
  totalExpenses: number; netProfit: number; profitMargin: string;
  totalDiscount: number; totalShipping: number; totalOrders: number; avgOrderValue: number;
  monthly: { month: string; revenue: number; offlineRevenue: number; expenses: number; profit: number }[];
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  businessInfo: Record<string, string>;
};

const EXPENSE_CATEGORIES = [
  { value: 'raw_material', label: '🧵 Raw Material' },
  { value: 'shipping', label: '🚚 Shipping' },
  { value: 'packaging', label: '📦 Packaging' },
  { value: 'marketing', label: '📣 Marketing' },
  { value: 'rent', label: '🏠 Rent' },
  { value: 'salary', label: '👤 Salary' },
  { value: 'tax', label: '🏛️ Tax' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'other', label: '📌 Other' },
];
const CATEGORY_COLORS: Record<string, string> = {
  raw_material: '#800020', shipping: '#3B82F6', packaging: '#F59E0B', marketing: '#8B5CF6',
  rent: '#EC4899', salary: '#10B981', tax: '#EF4444', utilities: '#6B7280', other: '#D97706',
};

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 Cash' },
  { value: 'upi', label: '📱 UPI' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer' },
  { value: 'cheque', label: '📄 Cheque' },
  { value: 'other', label: '📌 Other' },
];
const PAYMENT_COLORS: Record<string, string> = {
  cash: '#059669', upi: '#7C3AED', bank_transfer: '#2563EB', cheque: '#D97706', other: '#6B7280',
};
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Reusable Modal ───────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 16, width: '95%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-burgundy)', marginBottom: '1.5rem' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Expense Form ─────────────────────────────────────────────
const blankExpense = { title: '', amount: '', category: 'raw_material', description: '', vendor: '', expense_date: new Date().toISOString().slice(0, 10) };

function ExpenseForm({ initial, onSave, onClose }: { initial?: Partial<Expense> | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...blankExpense, ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    const method = initial?.id ? 'PUT' : 'POST';
    const url = initial?.id ? `/api/expenses/${initial.id}` : '/api/expenses';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const j = await res.json(); setErr(j.error); setSaving(false); return; }
    onSave(); onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Title *</label>
          <input required className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Fabric Purchase" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
          <input required type="number" min="0" step="0.01" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Category *</label>
          <select required className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date *</label>
          <input required type="date" className="input" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Vendor</label>
          <input className="input" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Supplier name" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Receipt URL</label>
          <input className="input" value={form.receipt_url || ''} onChange={e => set('receipt_url', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Description / Notes</label>
        <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional notes..." style={{ resize: 'vertical' }} />
      </div>
      {err && <p style={{ color: '#DC2626', fontSize: '0.85rem' }}>{err}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : initial?.id ? 'Update Expense' : 'Add Expense'}</button>
      </div>
    </form>
  );
}

// ─── Invoice Print View ───────────────────────────────────────
function InvoicePrintView({ invoice, bizInfo, items, onClose }: { invoice: Invoice; bizInfo: Record<string, string>; items: { name: string; quantity: number; price: number }[]; onClose: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={onClose} className="btn btn-outline">← Back</button>
        <button onClick={() => window.print()} className="btn btn-primary" id="print-invoice-btn">🖨️ Print / Save PDF</button>
      </div>
      <div id="invoice-print" style={{ background: 'white', padding: '2.5rem', borderRadius: 12, border: '1px solid #E5E7EB', maxWidth: 740, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #800020' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: '#800020', margin: 0 }}>{bizInfo.business_name || 'Isha Vastram'}</h1>
            {bizInfo.address && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6B7280' }}>{bizInfo.address}, {bizInfo.city} - {bizInfo.pincode}</p>}
            {bizInfo.gstin && <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6B7280' }}>GSTIN: {bizInfo.gstin}</p>}
            {bizInfo.phone && <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6B7280' }}>📞 {bizInfo.phone}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#800020', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>INVOICE</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{invoice.invoice_number}</div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Date: {fmtDate(invoice.created_at)}</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Order: {invoice.order.order_id}</div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.5rem' }}>Bill To</div>
          <div style={{ fontWeight: 600 }}>{invoice.customer.name}</div>
          {invoice.customer.address && <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{invoice.customer.address}, {invoice.customer.city} - {invoice.customer.pincode}</div>}
          <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>📞 {invoice.customer.phone}</div>
          {invoice.customer.email && <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>✉️ {invoice.customer.email}</div>}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['#', 'Item', 'Qty', 'Unit Price', 'Total'].map(h => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: h === '#' || h === 'Qty' ? 'center' : h === 'Unit Price' || h === 'Total' ? 'right' : 'left', borderBottom: '2px solid #E5E7EB', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#6B7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#9CA3AF' }}>{i + 1}</td>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginLeft: 'auto', maxWidth: 280 }}>
          {[
            ['Subtotal', fmt(invoice.subtotal)],
            ...(invoice.discount > 0 ? [['Discount', `−${fmt(invoice.discount)}`]] : []),
            ...(invoice.shipping > 0 ? [['Shipping', fmt(invoice.shipping)]] : []),
            ...(invoice.gst_percent > 0 ? [[`GST (${invoice.gst_percent}%)`, fmt(invoice.gst_amount)]] : []),
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.875rem', color: '#6B7280' }}>
              <span>{label}</span><span>{val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid #800020', fontWeight: 700, fontSize: '1.1rem', color: '#800020' }}>
            <span>Grand Total</span><span>{fmt(invoice.total)}</span>
          </div>
        </div>

        {/* Bank Details */}
        {bizInfo.bank_name && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#F9FAFB', borderRadius: 8, fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Payment Details</div>
            <div style={{ color: '#6B7280' }}>Bank: {bizInfo.bank_name} | A/C: {bizInfo.account_number} | IFSC: {bizInfo.ifsc_code}</div>
            {bizInfo.upi_id && <div style={{ color: '#6B7280' }}>UPI: {bizInfo.upi_id}</div>}
          </div>
        )}

        {invoice.notes && <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>Note: {invoice.notes}</div>}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#D1D5DB' }}>Thank you for shopping with {bizInfo.business_name || 'Isha Vastram'} 🌸</div>
      </div>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────
function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Manual Revenue Form ─────────────────────────────────────
const blankManualRev = { title: '', amount: '', payment_method: 'cash', customer_name: '', customer_phone: '', items_summary: '', description: '', sale_date: new Date().toISOString().slice(0, 10) };

function ManualRevenueForm({ initial, onSave, onClose }: { initial?: Partial<ManualRevenue> | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...blankManualRev, ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    const method = initial?.id ? 'PUT' : 'POST';
    const url = initial?.id ? `/api/revenue/${initial.id}` : '/api/revenue';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const j = await res.json(); setErr(j.error); setSaving(false); return; }
    onSave(); onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Sale Title *</label>
          <input required className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cash Sale at Market, Bulk Order" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
          <input required type="number" min="0" step="0.01" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Payment Method *</label>
          <select required className="input" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
            {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Customer Name</label>
          <input className="input" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Customer Phone</label>
          <input className="input" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Sale Date *</label>
          <input required type="date" className="input" value={form.sale_date} onChange={e => set('sale_date', e.target.value)} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Items Sold</label>
        <input className="input" value={form.items_summary} onChange={e => set('items_summary', e.target.value)} placeholder="e.g. 2x Cotton Saree, 1x Silk Dupatta" />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Notes</label>
        <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Any remarks..." style={{ resize: 'vertical' }} />
      </div>
      {err && <p style={{ color: '#DC2626', fontSize: '0.85rem' }}>{err}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : initial?.id ? 'Update Sale' : 'Record Sale'}</button>
      </div>
    </form>
  );
}

// ─── Main Finance Page ────────────────────────────────────────
export default function FinancePage() {
  const [tab, setTab] = useState<'dashboard' | 'expenses' | 'manual' | 'invoices' | 'tax' | 'ledger'>('dashboard');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [manualRevenues, setManualRevenues] = useState<ManualRevenue[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({ start: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) });
  const [expCategory, setExpCategory] = useState('all');
  const [invoiceStatus, setInvoiceStatus] = useState('all');
  const [revPaymentFilter, setRevPaymentFilter] = useState('all');

  // Modals
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; editing?: Expense | null }>({ open: false });
  const [manualRevModal, setManualRevModal] = useState<{ open: boolean; editing?: ManualRevenue | null }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'invoice' | 'revenue'; id: string } | null>(null);
  const [printInvoice, setPrintInvoice] = useState<{ invoice: Invoice; items: { name: string; quantity: number; price: number }[] } | null>(null);
  const [genInvoiceOrderId, setGenInvoiceOrderId] = useState<string | null>(null);
  const [gstInput, setGstInput] = useState('0');
  const [bizEdit, setBizEdit] = useState(false);
  const [bizForm, setBizForm] = useState<Record<string, string>>({});
  const [savingBiz, setSavingBiz] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sumRes, expRes, invRes, ordRes, revRes] = await Promise.all([
      fetch(`/api/finance/summary?startDate=${dateRange.start}T00:00:00Z&endDate=${dateRange.end}T23:59:59Z`),
      fetch(`/api/expenses?category=${expCategory}&startDate=${dateRange.start}&endDate=${dateRange.end}`),
      fetch(`/api/invoices?status=${invoiceStatus}`),
      fetch('/api/orders?page=1'),
      fetch(`/api/revenue?paymentMethod=${revPaymentFilter}&startDate=${dateRange.start}&endDate=${dateRange.end}`),
    ]);
    const [sumJson, expJson, invJson, ordJson, revJson] = await Promise.all([sumRes.json(), expRes.json(), invRes.json(), ordRes.json(), revRes.json()]);
    setSummary(sumJson);
    setExpenses(expJson.data || []);
    setManualRevenues(revJson.data || []);
    setInvoices(invJson.data || []);
    setOrders(ordJson.data || []);
    if (sumJson.businessInfo) setBizForm(sumJson.businessInfo);
    setLoading(false);
  }, [dateRange, expCategory, invoiceStatus, revPaymentFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteExpense = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    setDeleteTarget(null); fetchAll();
  };
  const deleteInvoice = async (id: string) => {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    setDeleteTarget(null); fetchAll();
  };
  const deleteRevenue = async (id: string) => {
    await fetch(`/api/revenue/${id}`, { method: 'DELETE' });
    setDeleteTarget(null); fetchAll();
  };
  const generateInvoice = async () => {
    if (!genInvoiceOrderId) return;
    const order = orders.find(o => o.id === genInvoiceOrderId);
    if (!order) return;
    await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: genInvoiceOrderId, gst_percent: parseFloat(gstInput) }) });
    setGenInvoiceOrderId(null); fetchAll();
  };
  const updateInvoiceStatus = async (id: string, status: string) => {
    await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchAll();
  };
  const loadPrintInvoice = async (inv: Invoice) => {
    const res = await fetch(`/api/invoices/${inv.id}`);
    const json = await res.json();
    const items = json.data?.order?.items || [];
    setPrintInvoice({ invoice: inv, items });
  };
  const saveBizInfo = async () => {
    setSavingBiz(true);
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'business_info', value: bizForm }) });
    setSavingBiz(false); setBizEdit(false); fetchAll();
  };

  if (printInvoice) {
    return (
      <>
        <InvoicePrintView
          invoice={printInvoice.invoice}
          bizInfo={summary?.businessInfo || {}}
          items={printInvoice.items}
          onClose={() => setPrintInvoice(null)}
        />
        <PrintStyles />
      </>
    );
  }

  const maxRev = summary ? Math.max(...summary.monthly.map(m => Math.max(m.revenue, m.expenses, 1))) : 1;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--color-burgundy)', margin: 0 }}>💰 Finance Hub</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', margin: '0.25rem 0 0' }}>Track expenses, generate invoices & manage P&L</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))} className="input" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
            <span style={{ color: '#9CA3AF' }}>→</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))} className="input" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2rem', borderBottom: '2px solid #E5E7EB' }}>
          {([
            ['dashboard', '📊 Dashboard'],
            ['expenses', '💸 Expenses'],
            ['manual', '💵 Manual Sales'],
            ['invoices', '🧾 Invoices'],
            ['tax', '📑 Tax & P&L'],
            ['ledger', '📦 Order Ledger'],
          ] as [typeof tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: tab === key ? 'var(--color-burgundy)' : '#9CA3AF', borderBottom: `3px solid ${tab === key ? 'var(--color-burgundy)' : 'transparent'}`, marginBottom: -2, transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Loading finance data…</div> : (
          <>
            {/* ── TAB 1: DASHBOARD ── */}
            {tab === 'dashboard' && summary && (
              <div>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Revenue', value: fmt(summary.totalRevenue), color: '#800020', icon: '💰', sub: `Online + Offline` },
                    { label: 'Online Orders', value: fmt(summary.onlineRevenue), color: '#7C3AED', icon: '💻', sub: `${summary.totalOrders} orders` },
                    { label: 'Offline / Cash', value: fmt(summary.offlineRevenue), color: '#059669', icon: '💵', sub: 'Manual sales' },
                    { label: 'Total Expenses', value: fmt(summary.totalExpenses), color: '#DC2626', icon: '💸', sub: 'All categories' },
                    { label: 'Net Profit', value: fmt(summary.netProfit), color: summary.netProfit >= 0 ? '#059669' : '#DC2626', icon: summary.netProfit >= 0 ? '📈' : '📉', sub: `${summary.profitMargin}% margin` },
                    { label: 'Avg Order Value', value: fmt(summary.avgOrderValue), color: '#D97706', icon: '🧾', sub: 'Online only' },
                  ].map(card => (
                    <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}` }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: card.color }}>{card.value}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{card.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Revenue vs Expenses Chart */}
                {summary.monthly.length > 0 && (
                  <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Revenue vs Expenses</h2>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', height: 160, marginBottom: '0.5rem' }}>
                      {summary.monthly.map(m => (
                        <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6B7280' }}>
                            {fmt(m.revenue).replace('₹', '')}
                          </div>
                          <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                            <div style={{ width: '42%', height: Math.round((m.revenue / maxRev) * 120) + 4, background: '#800020', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                            <div style={{ width: '42%', height: Math.round((m.expenses / maxRev) * 120) + 4, background: '#FCA5A5', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' })}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#800020', borderRadius: 2, marginRight: 4 }} />Revenue</span>
                      <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#FCA5A5', borderRadius: 2, marginRight: 4 }} />Expenses</span>
                    </div>
                  </div>
                )}

                {/* Expense by Category */}
                {Object.keys(summary.byCategory).length > 0 && (
                  <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Expense Breakdown</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a).map(([cat, amt]) => {
                        const label = EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat;
                        const pct = Math.round((amt / summary.totalExpenses) * 100);
                        return (
                          <div key={cat} style={{ padding: '0.75rem 1rem', borderRadius: 8, background: '#F9FAFB', borderLeft: `3px solid ${CATEGORY_COLORS[cat] || '#9CA3AF'}` }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: CATEGORY_COLORS[cat] || '#374151' }}>{fmt(amt)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{pct}% of expenses</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: EXPENSES ── */}
            {tab === 'expenses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select className="input" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }} value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                      <option value="all">All Categories</option>
                      {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                      Total: {fmt(expenses.reduce((s, e) => s + e.amount, 0))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => exportCSV(expenses.map(e => ({ Date: e.expense_date, Title: e.title, Category: e.category, Vendor: e.vendor || '', Amount: e.amount, Description: e.description || '' })), 'expenses.csv')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>⬇️ Export CSV</button>
                    <button onClick={() => setExpenseModal({ open: true, editing: null })} className="btn btn-primary" id="add-expense-btn">+ Add Expense</button>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Date', 'Title', 'Category', 'Vendor', 'Amount', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No expenses recorded yet. Click + Add Expense to start.</td></tr>
                      )}
                      {expenses.map(exp => (
                        <tr key={exp.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{fmtDate(exp.expense_date)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                            {exp.title}
                            {exp.description && <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{exp.description}</div>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: (CATEGORY_COLORS[exp.category] || '#9CA3AF') + '20', color: CATEGORY_COLORS[exp.category] || '#374151' }}>
                              {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{exp.vendor || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#DC2626' }}>{fmt(exp.amount)}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setExpenseModal({ open: true, editing: exp })} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                              <button onClick={() => setDeleteTarget({ type: 'expense', id: exp.id })} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#DC2626' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 3: MANUAL SALES ── */}
            {tab === 'manual' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select className="input" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }} value={revPaymentFilter} onChange={e => setRevPaymentFilter(e.target.value)}>
                      <option value="all">All Payment Methods</option>
                      {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                      Total: {fmt(manualRevenues.reduce((s, r) => s + r.amount, 0))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => exportCSV(manualRevenues.map(r => ({ Date: r.sale_date, Title: r.title, Customer: r.customer_name || '', Phone: r.customer_phone || '', Items: r.items_summary || '', Payment: r.payment_method, Amount: r.amount, Notes: r.description || '' })), 'manual_sales.csv')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>⬇️ Export CSV</button>
                    <button onClick={() => setManualRevModal({ open: true, editing: null })} className="btn btn-primary" id="add-manual-sale-btn">+ Add Sale</button>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Date', 'Title / Items', 'Customer', 'Payment', 'Amount', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {manualRevenues.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No manual sales recorded yet. Click + Add Sale to record an offline/cash transaction.</td></tr>
                      )}
                      {manualRevenues.map(rev => (
                        <tr key={rev.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{fmtDate(rev.sale_date)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                            {rev.title}
                            {rev.items_summary && <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{rev.items_summary}</div>}
                            {rev.description && <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>{rev.description}</div>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {rev.customer_name ? (
                              <div>
                                <div style={{ fontWeight: 500 }}>{rev.customer_name}</div>
                                {rev.customer_phone && <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{rev.customer_phone}</div>}
                              </div>
                            ) : <span style={{ color: '#9CA3AF' }}>—</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: (PAYMENT_COLORS[rev.payment_method] || '#9CA3AF') + '20', color: PAYMENT_COLORS[rev.payment_method] || '#374151' }}>
                              {PAYMENT_METHODS.find(p => p.value === rev.payment_method)?.label || rev.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669', fontSize: '1rem' }}>{fmt(rev.amount)}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setManualRevModal({ open: true, editing: rev })} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                              <button onClick={() => setDeleteTarget({ type: 'revenue', id: rev.id })} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#DC2626' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 4: INVOICES ── */}

            {tab === 'invoices' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <select className="input" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }} value={invoiceStatus} onChange={e => setInvoiceStatus(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="generated">Generated</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Invoice #', 'Order', 'Customer', 'Date', 'Total', 'GST', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No invoices yet. Generate one from the Order Ledger tab.</td></tr>
                      )}
                      {invoices.map(inv => {
                        const statusColor = inv.status === 'paid' ? '#059669' : inv.status === 'sent' ? '#3B82F6' : '#D97706';
                        return (
                          <tr key={inv.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>{inv.invoice_number}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6B7280', fontSize: '0.8rem' }}>{inv.order.order_id}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{inv.customer.name}<div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{inv.customer.phone}</div></td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{fmtDate(inv.created_at)}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{fmt(inv.total)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{inv.gst_percent > 0 ? `${inv.gst_percent}% (${fmt(inv.gst_amount)})` : 'None'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: `1px solid ${statusColor}`, color: statusColor, fontSize: '0.8rem', fontWeight: 600, background: statusColor + '15', cursor: 'pointer' }}>
                                <option value="generated">Generated</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => loadPrintInvoice(inv)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>🖨️ Print</button>
                                <button onClick={() => setDeleteTarget({ type: 'invoice', id: inv.id })} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#DC2626' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 4: TAX & P&L ── */}
            {tab === 'tax' && summary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* P&L Statement */}
                <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', fontSize: '1.1rem', margin: 0 }}>📑 Profit & Loss Statement</h2>
                    <button onClick={() => exportCSV(summary.monthly.map(m => ({ Month: m.month, Revenue: m.revenue, Expenses: m.expenses, Profit: m.profit })), 'pnl_monthly.csv')} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>⬇️ Export CSV</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Month', 'Revenue', 'Expenses', 'Net Profit', 'Margin'].map(h => (
                          <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.monthly.map(m => {
                        const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : '0';
                        return (
                          <tr key={m.month} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</td>
                            <td style={{ padding: '0.6rem 1rem', color: '#059669', fontWeight: 600 }}>{fmt(m.revenue)}</td>
                            <td style={{ padding: '0.6rem 1rem', color: '#DC2626' }}>{fmt(m.expenses)}</td>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 700, color: m.profit >= 0 ? '#059669' : '#DC2626' }}>{fmt(m.profit)}</td>
                            <td style={{ padding: '0.6rem 1rem', color: '#6B7280' }}>{margin}%</td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#F9FAFB', fontWeight: 700 }}>
                        <td style={{ padding: '0.75rem 1rem' }}>Total ({dateRange.start.slice(0,4)})</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#059669' }}>{fmt(summary.totalRevenue)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#DC2626' }}>{fmt(summary.totalExpenses)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: summary.netProfit >= 0 ? '#059669' : '#DC2626' }}>{fmt(summary.netProfit)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{summary.profitMargin}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Business Info Editor */}
                <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', fontSize: '1.1rem', margin: 0 }}>🏢 Business Information</h2>
                    <button onClick={() => setBizEdit(!bizEdit)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>{bizEdit ? 'Cancel' : '✏️ Edit'}</button>
                  </div>
                  {bizEdit ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                      {[
                        ['business_name', 'Business Name'], ['gstin', 'GSTIN'], ['pan', 'PAN'],
                        ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'],
                        ['phone', 'Phone'], ['email', 'Email'],
                        ['bank_name', 'Bank Name'], ['account_number', 'Account Number'], ['ifsc_code', 'IFSC Code'], ['upi_id', 'UPI ID'],
                      ].map(([key, label]) => (
                        <div key={key}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
                          <input className="input" value={bizForm[key] || ''} onChange={e => setBizForm(f => ({ ...f, [key]: e.target.value }))} />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button onClick={() => setBizEdit(false)} className="btn btn-outline">Cancel</button>
                        <button onClick={saveBizInfo} disabled={savingBiz} className="btn btn-primary">{savingBiz ? 'Saving…' : 'Save Business Info'}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                      {Object.entries(bizForm).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} style={{ padding: '0.75rem', background: '#F9FAFB', borderRadius: 8 }}>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9CA3AF', marginBottom: 4 }}>{k.replace(/_/g, ' ')}</div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{v}</div>
                        </div>
                      ))}
                      {Object.values(bizForm).every(v => !v) && <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No business info added yet. Click Edit to add your GSTIN, PAN, bank details etc.</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 5: ORDER LEDGER ── */}
            {tab === 'ledger' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.75rem' }}>
                  <button onClick={() => exportCSV(orders.map(o => ({ OrderID: o.order_id, Date: fmtDate(o.created_at), Customer: o.customer?.name, Phone: o.customer?.phone, Subtotal: o.subtotal, Discount: o.discount_amount, Shipping: o.shipping, Total: o.total, Status: o.status, Notes: o.notes || '' })), 'orders_ledger.csv')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>⬇️ Export CSV</button>
                </div>
                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Order #', 'Date', 'Customer', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Status', 'Invoice'].map(h => (
                          <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const existingInvoice = invoices.find(inv => inv.order?.order_id === o.order_id);
                        return (
                          <tr key={o.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--color-burgundy)', whiteSpace: 'nowrap' }}>{o.order_id}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <div style={{ fontWeight: 500 }}>{o.customer?.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{o.customer?.phone}</div>
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#6B7280', maxWidth: 140 }}>
                              {o.items?.slice(0, 2).map(i => <div key={i.name} style={{ fontSize: '0.7rem' }}>{i.quantity}× {i.name.substring(0, 20)}</div>)}
                              {(o.items?.length || 0) > 2 && <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>+{(o.items?.length || 0) - 2} more</div>}
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>{fmt(o.subtotal)}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#D97706' }}>{o.discount_amount > 0 ? `−${fmt(o.discount_amount)}` : '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#6B7280' }}>{fmt(o.shipping)}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{fmt(o.total)}</td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <span style={{ padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: o.status === 'delivered' ? '#D1FAE5' : o.status === 'shipped' ? '#DBEAFE' : o.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7', color: o.status === 'delivered' ? '#059669' : o.status === 'shipped' ? '#2563EB' : o.status === 'cancelled' ? '#DC2626' : '#D97706' }}>
                                {o.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              {existingInvoice ? (
                                <button onClick={() => loadPrintInvoice(existingInvoice)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>🖨️ {existingInvoice.invoice_number}</button>
                              ) : (
                                <button onClick={() => setGenInvoiceOrderId(o.id)} style={{ background: 'none', border: '1px solid #800020', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: '#800020', fontWeight: 600 }}>+ Invoice</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      {/* ── Expense Modal ── */}
      <Modal open={expenseModal.open} onClose={() => setExpenseModal({ open: false })} title={expenseModal.editing ? 'Edit Expense' : 'Add New Expense'}>
        <ExpenseForm initial={expenseModal.editing} onSave={fetchAll} onClose={() => setExpenseModal({ open: false })} />
      </Modal>

      {/* ── Manual Revenue Modal ── */}
      <Modal open={manualRevModal.open} onClose={() => setManualRevModal({ open: false })} title={manualRevModal.editing ? 'Edit Manual Sale' : 'Record Offline / Manual Sale'}>
        <ManualRevenueForm initial={manualRevModal.editing} onSave={fetchAll} onClose={() => setManualRevModal({ open: false })} />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Are you sure you want to delete this {deleteTarget?.type === 'revenue' ? 'manual sale' : deleteTarget?.type}? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteTarget(null)} className="btn btn-outline">Cancel</button>
          <button onClick={() => {
            if (!deleteTarget) return;
            if (deleteTarget.type === 'expense') deleteExpense(deleteTarget.id);
            else if (deleteTarget.type === 'invoice') deleteInvoice(deleteTarget.id);
            else deleteRevenue(deleteTarget.id);
          }} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
        </div>
      </Modal>

      {/* ── Generate Invoice Modal ── */}
      <Modal open={!!genInvoiceOrderId} onClose={() => setGenInvoiceOrderId(null)} title="Generate Invoice">
        {genInvoiceOrderId && (() => {
          const o = orders.find(ord => ord.id === genInvoiceOrderId);
          return o ? (
            <div>
              <p style={{ color: '#6B7280', marginBottom: '1rem', fontSize: '0.875rem' }}>Generating invoice for order <strong>{o.order_id}</strong> — {o.customer?.name}</p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>GST % (0 if not applicable)</label>
                <input type="number" min="0" max="28" step="0.5" className="input" value={gstInput} onChange={e => setGstInput(e.target.value)} placeholder="0" />
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Enter 5 for 5% GST, 12 for 12%, etc. Leave 0 if not registered.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setGenInvoiceOrderId(null)} className="btn btn-outline">Cancel</button>
                <button onClick={generateInvoice} className="btn btn-primary">Generate Invoice</button>
              </div>
            </div>
          ) : null;
        })()}
      </Modal>

      <PrintStyles />
    </>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body > * { display: none !important; }
        #invoice-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        #print-invoice-btn { display: none !important; }
      }
    `}</style>
  );
}
