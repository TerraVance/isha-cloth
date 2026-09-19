'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string; name: string; category: string; price: number;
  stock: number; sold: number; share_count: number;
  status: string; featured: boolean; images: string[];
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restockCounts, setRestockCounts] = useState<Record<string, number>>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: 'true', pageSize: '50' });
    if (status !== 'all') params.set('status', status);
    const res = await fetch(`/api/products?${params}`);
    const json = await res.json();
    setProducts(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Fetch restock request counts for low-stock products
  useEffect(() => {
    const lowStockIds = products.filter(p => p.stock === 0).map(p => p.id);
    if (!lowStockIds.length) return;
    fetch('/api/restock-requests')
      .then(r => r.json())
      .then(j => {
        const counts: Record<string, number> = {};
        (j.data || []).forEach((r: { product_id: string }) => {
          counts[r.product_id] = (counts[r.product_id] || 0) + 1;
        });
        setRestockCounts(counts);
      });
  }, [products]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    setDeleting(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
            Products <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-400)', fontWeight: 400 }}>({total})</span>
          </h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-md" id="add-product-btn">
          + Add New Saree
        </Link>
      </div>

      <div className="admin-content">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search sarees…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ maxWidth: 280 }}
            id="product-search"
          />
          {['all', 'active', 'draft'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`category-pill${status === s ? ' active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>🔄 Shares</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}><span className="spinner dark" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={p.stock === 0 ? 'low-stock' : ''}>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <div style={{ width: 52, height: 68, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-cream)', flexShrink: 0, position: 'relative' }}>
                        {p.images[0]
                          ? <Image src={p.images[0]} alt="" fill style={{ objectFit: 'cover' }} sizes="52px" />
                          : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🌸</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.name}</div>
                        {p.featured && <span className="badge badge-new" style={{ fontSize: 10 }}>Featured</span>}
                        {restockCounts[p.id] && (
                          <div style={{ fontSize: 10, color: 'var(--color-warning)', marginTop: 2 }}>
                            🔔 {restockCounts[p.id]} waiting
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>{p.category}</td>
                  <td><strong style={{ color: 'var(--color-maroon)' }}>₹{Number(p.price).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--color-error)' : p.stock <= 5 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock}
                    </span>
                  </td>
                  <td>{p.sold}</td>
                  <td>
                    <span style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>📤 {p.share_count}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-draft'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      aria-label={`Toggle ${p.name} status`}
                    >
                      {p.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Link href={`/admin/products/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="btn btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        disabled={deleting === p.id}
                      >
                        {deleting === p.id ? '…' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .category-pill {
          padding: var(--space-2) var(--space-5);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 500;
          border: 1.5px solid var(--color-gray-300);
          background: white;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .category-pill.active {
          background: var(--color-maroon);
          border-color: var(--color-maroon);
          color: white;
        }
        .category-pill:hover:not(.active) { border-color: var(--color-maroon); color: var(--color-maroon); }
      `}</style>
    </div>
  );
}
