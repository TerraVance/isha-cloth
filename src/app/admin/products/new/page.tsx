'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SareeCard from '@/components/product/SareeCard';

const CATEGORIES = ['Cotton', 'Silk', 'Banarasi', 'Paithani', 'Chanderi', 'Kanjivaram', 'Linen', 'Georgette'];
const TAG_OPTIONS = ['Festive', 'Bridal', 'Daily Wear', 'Office Wear', 'Party', 'Traditional', 'Summer', 'Wedding'];

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', category: 'Cotton',
    price: '', compare_price: '', color: '',
    stock: '', tags: [] as string[],
    status: 'active', featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [posterImage, setPosterImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isPosterDragging, setIsPosterDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'products');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) uploaded.push(json.url);
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handlePosterUpload = async (files: FileList) => {
    setUploadingPoster(true);
    const fd = new FormData();
    fd.append('file', files[0]);
    fd.append('bucket', 'products');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.url) setPosterImage(json.url);
    setUploadingPoster(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Valid price is required';
    if (!form.stock || isNaN(Number(form.stock))) errs.stock = 'Stock quantity is required';
    if (images.length === 0) errs.images = 'At least one image is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock: Number(form.stock),
        images,
      }),
    });

    if (res.ok) {
      const saved = await res.json();
      // If a poster image was uploaded, create a hero_poster entry
      if (posterImage && saved.data?.id) {
        await fetch('/api/posters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: posterImage,
            product_id: saved.data.id,
            title: form.name,
            sort_order: 0,
          }),
        });
      }
      router.push('/admin/products');
    } else {
      const json = await res.json();
      setErrors({ submit: json.error || 'Failed to save product.' });
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)' }}>Add New Saree</h1>
        </div>
        <button onClick={() => router.back()} className="btn btn-ghost btn-md">← Back</button>
      </div>

      <div className="admin-content">
        <form onSubmit={handleSubmit}>
          <div className="admin-grid">

            {/* Left: Product Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Basic Info */}
              <div className="card" style={{ padding: 'var(--space-7)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                  Basic Information
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="name">Saree Name *</label>
                    <input id="name" name="name" className={`input${errors.name ? ' error' : ''}`} placeholder="e.g., Pure Cotton Floral Saree" value={form.name} onChange={handleChange} />
                    {errors.name && <span className="input-error-msg">{errors.name}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="input" placeholder="Describe the fabric, weave, occasions…" value={form.description} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="category">Category</label>
                      <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="color">Colour (optional)</label>
                      <input id="color" name="color" className="input" placeholder="e.g., Maroon, Teal" value={form.color} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card" style={{ padding: 'var(--space-7)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-4)' }}>
                  Tags
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {TAG_OPTIONS.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`category-pill${form.tags.includes(tag) ? ' active' : ''}`}
                      aria-pressed={form.tags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="card" style={{ padding: 'var(--space-7)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-4)' }}>
                  Product Images *
                </h2>
                {errors.images && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>{errors.images}</p>}

                {/* Existing images */}
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                    {images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 100, height: 130, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <Image src={url} alt="" fill style={{ objectFit: 'cover' }} sizes="100px" />
                        <button
                          type="button"
                          onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}
                          aria-label="Remove image"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  id="image-upload"
                  onChange={e => e.target.files && handleImageUpload(e.target.files)}
                />

                {/* C2: Drag & Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--color-maroon)' : 'var(--color-gray-300)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-8) var(--space-4)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(128,0,32,0.04)' : 'var(--color-cream)',
                    transition: 'all 0.2s ease',
                  }}
                  id="upload-images-btn"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload images area"
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <><span className="spinner dark" /> <span style={{ marginLeft: 8, color: 'var(--color-gray-500)' }}>Uploading…</span></>
                  ) : (
                    <>
                      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>📸</div>
                      <p style={{ fontWeight: 600, color: isDragging ? 'var(--color-maroon)' : 'var(--color-burgundy)', marginBottom: 4 }}>
                        {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>or click to browse — JPG/PNG, max 5MB each</p>
                    </>
                  )}
                </div>
              </div>

              {/* ── Poster Image Upload ── */}
              <div className="card" style={{ padding: 'var(--space-7)', borderTop: '2px solid var(--color-gold-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)' }}>
                    🖼️ Poster Image
                  </h2>
                  <span style={{ fontSize: 'var(--text-xs)', background: 'var(--color-cream-dark)', color: 'var(--color-gold-dark)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    OPTIONAL
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  Upload a portrait-style poster for the <strong>homepage scrolling marquee</strong>. Best size: 3:4 ratio (e.g. 600×800px). This will be automatically linked to this saree.
                </p>

                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="poster-upload"
                  onChange={e => e.target.files && handlePosterUpload(e.target.files)}
                />

                <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Preview */}
                  {posterImage && (
                    <div style={{ position: 'relative', width: 110, height: 146, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-gold)', flexShrink: 0 }}>
                      <Image src={posterImage} alt="Poster preview" fill style={{ objectFit: 'cover' }} sizes="110px" />
                      <button
                        type="button"
                        onClick={() => setPosterImage('')}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label="Remove poster"
                      >✕</button>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'var(--color-gold-light)', fontSize: 9, textAlign: 'center', padding: '3px 0', letterSpacing: '0.1em' }}>POSTER</div>
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setIsPosterDragging(true); }}
                    onDragLeave={() => setIsPosterDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsPosterDragging(false);
                      if (e.dataTransfer.files?.length) handlePosterUpload(e.dataTransfer.files);
                    }}
                    onClick={() => posterInputRef.current?.click()}
                    style={{
                      flex: 1,
                      minWidth: 180,
                      border: `2px dashed ${isPosterDragging ? 'var(--color-gold)' : 'var(--color-gold-light)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-6) var(--space-4)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isPosterDragging ? 'rgba(201,148,42,0.06)' : 'rgba(201,148,42,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                    id="upload-poster-btn"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload poster image"
                    onKeyDown={e => e.key === 'Enter' && posterInputRef.current?.click()}
                  >
                    {uploadingPoster ? (
                      <><span className="spinner dark" /> <span style={{ marginLeft: 8, color: 'var(--color-gray-500)' }}>Uploading…</span></>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🖼️</div>
                        <p style={{ fontWeight: 600, color: isPosterDragging ? 'var(--color-gold-dark)' : 'var(--color-burgundy)', marginBottom: 4, fontSize: 'var(--text-sm)' }}>
                          {isPosterDragging ? 'Drop poster here!' : posterImage ? 'Replace poster image' : 'Upload poster image'}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>Portrait 3:4 ratio — JPG/PNG, max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pricing & Publish */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-4))' }}>

              {/* Pricing */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                  Pricing
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="price">Selling Price (₹) *</label>
                    <input id="price" name="price" type="number" className={`input${errors.price ? ' error' : ''}`} placeholder="e.g., 1299" value={form.price} onChange={handleChange} min="1" step="1" />
                    {errors.price && <span className="input-error-msg">{errors.price}</span>}
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="compare_price">Original Price (₹) <span style={{ color: 'var(--color-gray-400)' }}>for strike-through</span></label>
                    <input id="compare_price" name="compare_price" type="number" className="input" placeholder="e.g., 1799 (optional)" value={form.compare_price} onChange={handleChange} min="1" step="1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="stock">Stock Quantity *</label>
                    <input id="stock" name="stock" type="number" className={`input${errors.stock ? ' error' : ''}`} placeholder="e.g., 10" value={form.stock} onChange={handleChange} min="0" step="1" />
                    {errors.stock && <span className="input-error-msg">{errors.stock}</span>}
                  </div>
                </div>
              </div>

              {/* Publish Settings */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                  Publish Settings
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <label htmlFor="featured" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>⭐ Featured on Homepage</label>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>Show in the featured collection</p>
                    </div>
                    <input id="featured" name="featured" type="checkbox" checked={form.featured} onChange={handleChange} style={{ width: 20, height: 20, cursor: 'pointer' }} />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="status">Status</label>
                    <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                      <option value="active">Active — Visible on store</option>
                      <option value="draft">Draft — Hidden from store</option>
                    </select>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  {errors.submit}
                </div>
              )}



              {/* Live Preview (B10) */}
              <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-4)' }}>
                  Live Preview
                </h2>
                <div>
                  <SareeCard product={{
                    id: 'preview-123',
                    name: form.name || 'Saree Name',
                    price: Number(form.price) || 999,
                    compare_price: form.compare_price ? Number(form.compare_price) : null,
                    images: images.length > 0 ? images : [''],
                    category: form.category,
                    stock: Number(form.stock) || 10,
                    status: form.status as 'active' | 'draft',
                    tags: form.tags,
                    color: form.color,
                    featured: form.featured,
                    sold: 0,
                    share_count: 0,
                    description: form.description,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }} 
                  asPreview={true}
                  customAction={
                    <button type="submit" className="btn btn-primary btn-lg" id="save-product-btn" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                      {saving ? <><span className="spinner" /> Saving…</> : '✅ Save Product'}
                    </button>
                  } />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .category-pill {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 500;
          border: 1.5px solid var(--color-gray-300);
          background: white;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .category-pill.active { background: var(--color-maroon); border-color: var(--color-maroon); color: white; }
        .category-pill:hover:not(.active) { border-color: var(--color-maroon); color: var(--color-maroon); }
      `}</style>
    </div>
  );
}
