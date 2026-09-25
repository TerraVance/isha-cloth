'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

interface Testimonial {
  id: string; customer_name: string; customer_phone: string | null;
  review_text: string; rating: number; is_approved: boolean;
  photo_url: string | null; created_at: string;
  product?: { name: string } | null;
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string; loading: boolean; error: string }>({
    open: false, id: '', name: '', loading: false, error: '',
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'pending') params.set('approved', 'false');
    if (filter === 'approved') params.set('approved', 'true');
    const res = await fetch(`/api/testimonials?${params}`);
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTestimonials(); }, [filter]);

  const handleApprove = async (id: string) => {
    setUpdating(id);
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: true }),
    });
    if (!res.ok) {
      alert('Failed to approve testimonial.');
      setUpdating(null);
      return;
    }
    fetchTestimonials();
    setUpdating(null);
  };

  const handleReject = async (id: string, name: string) => {
    setDeleteModal({ open: true, id, name, loading: false, error: '' });
  };

  const confirmDelete = async () => {
    setDeleteModal(m => ({ ...m, loading: true, error: '' }));
    setUpdating(deleteModal.id);
    const res = await fetch(`/api/testimonials/${deleteModal.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg = res.status === 401
        ? 'Session expired. Please refresh and log in again.'
        : json.error || 'Failed to delete testimonial. Please try again.';
      setDeleteModal(m => ({ ...m, loading: false, error: msg }));
      setUpdating(null);
      return;
    }
    setDeleteModal({ open: false, id: '', name: '', loading: false, error: '' });
    fetchTestimonials();
    setUpdating(null);
  };

  const pendingCount = items.filter(t => !t.is_approved).length;

  return (
    <div>
      <div className="admin-header">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>
          ⭐ Testimonials
          {pendingCount > 0 && <span style={{ marginLeft: 'var(--space-3)', background: 'var(--color-error)', color: 'white', fontSize: 'var(--text-sm)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>{pendingCount} pending</span>}
        </h1>
      </div>

      <div className="admin-content">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {(['pending', 'approved', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`category-pill${filter === f ? ' active' : ''}`} style={{ textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f === 'pending' ? '🕐 Pending Approval' : '✅ Approved'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}><span className="spinner dark" style={{ width: 32, height: 32 }} /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-gray-400)' }}>
            <div style={{ fontSize: '3rem' }}>⭐</div>
            <p style={{ marginTop: 'var(--space-4)' }}>
              {filter === 'pending' ? 'No pending reviews! All caught up ✅' : 'No reviews found.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
            {items.map(t => (
              <div key={t.id} className="testimonial-admin-card" style={{ borderLeft: `4px solid ${t.is_approved ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'flex-start' }}>
                  {/* Photo or avatar */}
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-gold), var(--color-maroon))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 'var(--text-xl)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                    {t.photo_url
                      ? <Image src={t.photo_url} alt="" fill style={{ objectFit: 'cover' }} sizes="52px" />
                      : t.customer_name.charAt(0)
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{t.customer_name}</div>
                    {t.customer_phone && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>📱 {t.customer_phone}</div>}
                    {t.product && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-dark)' }}>on {t.product.name}</div>}
                  </div>
                  <div style={{ color: '#D4A537', fontSize: '1rem' }}>{'★'.repeat(t.rating || 5)}</div>
                </div>

                {/* Review text */}
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                  &ldquo;{t.review_text}&rdquo;
                </p>

                {/* Date */}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-4)' }}>
                  {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  {!t.is_approved ? (
                    <>
                      <button
                        onClick={() => handleApprove(t.id)}
                        className="btn btn-sm"
                        style={{ flex: 1, background: 'var(--color-success)', color: 'white', justifyContent: 'center' }}
                        disabled={updating === t.id}
                        id={`approve-${t.id}`}
                      >
                        {updating === t.id ? <span className="spinner" /> : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(t.id, t.customer_name)}
                        className="btn btn-sm btn-outline"
                        style={{ flex: 1, color: 'var(--color-error)', borderColor: 'var(--color-error)', justifyContent: 'center' }}
                        disabled={updating === t.id}
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>✅ Published on homepage</span>
                      <button onClick={() => handleReject(t.id, t.customer_name)} className="btn btn-sm" style={{ color: 'var(--color-error)' }}>Remove</button>
                    </div>
                  )}
                </div>
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

        .testimonial-admin-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-100);
          transition: box-shadow var(--transition-fast);
        }
        .testimonial-admin-card:hover { box-shadow: var(--shadow-md); }
      `}</style>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        title="Delete Testimonial"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        itemName={deleteModal.name}
        isDeleting={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: '', name: '', loading: false, error: '' })}
      />
    </div>
  );
}
