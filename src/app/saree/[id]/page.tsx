'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types/database';
import { buildShareSareeMessage } from '@/lib/whatsapp';
import SareeCard from '@/components/product/SareeCard';

export default function SareeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, isInCart, applyCoupon, removeCoupon } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  // Coupon
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{ valid: boolean; message: string; discountPercent?: number; discountAmount?: number } | null>(null);

  // Restock notification form
  const [showNotify, setShowNotify] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(async j => {
        setProduct(j.data);
        if (j.data) {
          // Fetch related sarees
          const relRes = await fetch(`/api/products?category=${j.data.category}&exclude=${j.data.id}&pageSize=4`);
          const relJson = await relRes.json();
          setRelatedProducts(relJson.data || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      stock: product.stock,
      quantity: qty,
    });
    setTimeout(() => {
      setAddingToCart(false);
      setAdded(true);
      toast.success(`${product.name} added to cart!`);
    }, 500);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !product) return;
    setCouponLoading(true);
    setCouponStatus(null);
    try {
      const subtotal = product.price * qty;
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const json = await res.json();
      if (json.valid) {
        applyCoupon(couponCode.toUpperCase().trim(), json.discountPercent, json.discountAmount);
        setCouponStatus({ valid: true, message: json.message, discountPercent: json.discountPercent, discountAmount: json.discountAmount });
      } else {
        setCouponStatus({ valid: false, message: json.reason });
      }
    } catch {
      setCouponStatus({ valid: false, message: 'Could not validate coupon. Try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  // 🔄 Viral Loop: Share button
  const handleShare = async () => {
    if (!product) return;
    const message = buildShareSareeMessage({ sareeName: product.name, sareeId: product.id });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Increment share count
    await fetch(`/api/products/${product.id}/share`, { method: 'POST' });

    window.open(waUrl, '_blank');
  };

  // 🔄 Restock Loop: Notify me
  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setNotifyLoading(true);
    try {
      const res = await fetch('/api/restock-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, phone: notifyPhone }),
      });
      const json = await res.json();
      setNotifyMsg(json.message || json.error || 'Done!');
      if (res.ok) setNotifyPhone('');
    } catch {
      setNotifyMsg('Something went wrong. Please try again.');
    } finally {
      setNotifyLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner dark" style={{ width: 40, height: 40 }} />
      </div>
      <Footer />
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)' }}>Saree not found</h2>
        <button className="btn btn-primary btn-md" style={{ marginTop: '2rem' }} onClick={() => router.push('/collection')}>
          Browse Collection
        </button>
      </div>
      <Footer />
    </>
  );

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;
  const inCart = isInCart(product.id);
  const isOos = product.stock === 0;

  return (
    <>
      <Navbar />
      {/* B11: JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description || `Buy ${product.name} at Isha Vastram.`,
            "sku": product.id,
            "offers": {
              "@type": "Offer",
              "url": `https://ishacloth.com/saree/${product.id}`,
              "priceCurrency": "INR",
              "price": product.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            }
          })
        }}
      />
      <main>
        <div className="container detail-container">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="detail-breadcrumb">
            <a href="/">Home</a> <span>/</span>
            <a href="/collection">Collection</a> <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className="detail-grid">
            {/* === Image Gallery === */}
            <div className="detail-gallery">
              <div className="main-image-wrap">
                {product.images[activeImage] ? (
                  <Image
                    src={product.images[activeImage]}
                    alt={`${product.name} — view ${activeImage + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="detail-no-image">🌸</div>
                )}

                {discount && (
                  <div className="detail-discount-badge">{discount}% OFF</div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="thumbnails">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      className={`thumb${activeImage === i ? ' thumb-active' : ''}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image src={img} alt="" fill style={{ objectFit: 'cover' }} sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === Product Info === */}
            <div className="detail-info">
              <div className="detail-badges">
                <span className="badge badge-active">{product.category}</span>
                {product.featured && <span className="badge badge-new">Featured</span>}
                {product.color && <span className="badge badge-draft">{product.color}</span>}
              </div>

              <h1 className="detail-name">{product.name}</h1>

              {/* Price */}
              <div className="detail-price">
                <span className="detail-price-current">
                  {couponStatus?.valid && couponStatus.discountAmount
                    ? `₹${(product.price * qty - couponStatus.discountAmount).toLocaleString('en-IN')}`
                    : `₹${product.price.toLocaleString('en-IN')}`}
                </span>
                {couponStatus?.valid && couponStatus.discountAmount ? (
                  <span className="detail-price-original">₹{(product.price * qty).toLocaleString('en-IN')}</span>
                ) : product.compare_price ? (
                  <span className="detail-price-original">₹{product.compare_price.toLocaleString('en-IN')}</span>
                ) : null}
                {couponStatus?.valid && couponStatus.discountPercent
                  ? <span className="detail-price-save">Coupon: {couponStatus.discountPercent}% off</span>
                  : discount
                  ? <span className="detail-price-save">Save {discount}%</span>
                  : null}
              </div>

              {/* 🎟️ Coupon Widget */}
              <div className="coupon-widget">
                {!couponStatus?.valid ? (
                  <button
                    type="button"
                    className="coupon-toggle"
                    onClick={() => setCouponOpen(o => !o)}
                    aria-expanded={couponOpen}
                  >
                    🎟️ Have a coupon code?
                    <span className="coupon-toggle-arrow" style={{ transform: couponOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </button>
                ) : (
                  <div className="coupon-applied">
                    <span>🎉 {couponStatus.message}</span>
                    <button
                      type="button"
                      onClick={() => { removeCoupon(); setCouponStatus(null); setCouponCode(''); setCouponOpen(false); }}
                      className="coupon-remove"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                {couponOpen && !couponStatus?.valid && (
                  <div className="coupon-input-wrap">
                    <input
                      type="text"
                      className="input coupon-input"
                      placeholder="Enter code e.g. SAVE20"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      maxLength={30}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      id="apply-coupon-btn"
                    >
                      {couponLoading ? <span className="spinner" /> : 'Apply'}
                    </button>
                  </div>
                )}

                {couponStatus && !couponStatus.valid && (
                  <p className="coupon-error">{couponStatus.message}</p>
                )}
              </div>

              {/* Stock indicator */}
              <div className="detail-stock">
                {isOos ? (
                  <span className="stock-oos">❌ Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="stock-low">⚠️ Only {product.stock} left!</span>
                ) : (
                  <span className="stock-ok">✅ In Stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="detail-desc">
                  <h2 className="detail-section-title">About This Saree</h2>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="detail-tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="detail-tag">{tag}</span>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="detail-ctas">
                {isOos ? (
                  <div className="restock-section">
                    <button
                      className="btn btn-outline btn-lg detail-btn"
                      onClick={() => setShowNotify(!showNotify)}
                      id="notify-me-btn"
                    >
                      🔔 Notify Me When Available
                    </button>

                    {showNotify && (
                      <form onSubmit={handleNotifySubmit} className="notify-form">
                        <p className="notify-form-title">Get notified on WhatsApp when it's back!</p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                          <input
                            type="tel"
                            value={notifyPhone}
                            onChange={e => setNotifyPhone(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="input"
                            maxLength={10}
                            pattern="[6-9][0-9]{9}"
                            required
                          />
                          <button
                            type="submit"
                            className="btn btn-primary btn-md"
                            disabled={notifyLoading}
                            id="notify-submit"
                          >
                            {notifyLoading ? <span className="spinner" /> : 'Notify'}
                          </button>
                        </div>
                        {notifyMsg && (
                          <p className="notify-msg">{notifyMsg}</p>
                        )}
                      </form>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="qty-selector">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={qty >= product.stock}>+</button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className={`btn btn-primary btn-lg detail-btn${added || inCart ? ' btn-added' : ''}`}
                      disabled={addingToCart}
                      id="detail-add-to-cart"
                    >
                      {addingToCart ? (
                        <><span className="spinner" /> Adding…</>
                      ) : added || inCart ? (
                        <>✓ Added to Cart</>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>

                    {(added || inCart) && (
                      <a href="/cart" className="btn btn-gold btn-lg detail-btn" id="go-to-cart">
                        Go to Cart →
                      </a>
                    )}
                  </>
                )}

                {/* 🔄 Viral Loop: Share on WhatsApp */}
                <button
                  onClick={handleShare}
                  className="btn btn-whatsapp btn-lg detail-btn detail-share"
                  id="share-whatsapp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share on WhatsApp
                  {product.share_count > 0 && (
                    <span className="share-count">({product.share_count})</span>
                  )}
                </button>
              </div>

              {/* Trust badges */}
              <div className="trust-badges">
                {['🌿 Pure Cotton', '🔒 Secure Order', '🚀 Fast Delivery', '✅ Easy Returns'].map(b => (
                  <span key={b} className="trust-badge">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <section className="section" style={{ background: 'var(--color-cream)' }}>
            <div className="container">
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>You May Also Like</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                {relatedProducts.map(p => (
                  <SareeCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppFAB />

      <style>{`
        .detail-container { padding-top: var(--space-8); padding-bottom: var(--space-16); }

        .detail-breadcrumb {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: var(--text-sm); color: var(--color-gray-500);
          margin-bottom: var(--space-8);
        }
        .detail-breadcrumb a { color: var(--color-maroon); }
        .detail-breadcrumb a:hover { text-decoration: underline; }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          align-items: start;
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; gap: var(--space-8); }
        }

        .detail-gallery { position: sticky; top: calc(var(--navbar-height) + var(--space-4)); }

        .main-image-wrap {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          background: var(--color-cream);
          margin-bottom: var(--space-4);
        }

        .detail-no-image {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 5rem;
        }

        .detail-discount-badge {
          position: absolute; top: var(--space-4); left: var(--space-4);
          background: var(--color-error); color: white;
          font-size: var(--text-sm); font-weight: 700;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
        }

        .thumbnails {
          display: flex; gap: var(--space-3); overflow-x: auto;
          scrollbar-width: none;
        }
        .thumbnails::-webkit-scrollbar { display: none; }

        .thumb {
          position: relative;
          width: 80px; height: 100px; flex-shrink: 0;
          border-radius: var(--radius-md); overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer; transition: border-color var(--transition-fast);
        }
        .thumb-active { border-color: var(--color-maroon); }
        .thumb:hover { border-color: var(--color-gold); }

        .detail-badges { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }

        .detail-name {
          font-family: var(--font-heading);
          font-size: var(--text-4xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-5);
          line-height: 1.2;
        }

        .detail-price {
          display: flex; align-items: center; gap: var(--space-4);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }

        .detail-price-current {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: var(--color-maroon);
          font-family: var(--font-heading);
        }

        .detail-price-original {
          font-size: var(--text-xl);
          color: var(--color-gray-400);
          text-decoration: line-through;
        }

        .detail-price-save {
          background: var(--color-error-light);
          color: var(--color-error);
          font-size: var(--text-sm);
          font-weight: 600;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
        }

        .detail-stock { margin-bottom: var(--space-5); font-weight: 500; }
        .stock-ok  { color: var(--color-success); }
        .stock-low { color: var(--color-warning); }
        .stock-oos { color: var(--color-error); }

        .detail-desc {
          margin-bottom: var(--space-5);
          padding: var(--space-5);
          background: var(--color-cream);
          border-radius: var(--radius-lg);
          border-left: 3px solid var(--color-gold);
        }

        .detail-section-title {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          color: var(--color-burgundy);
          margin-bottom: var(--space-2);
        }

        .detail-tags {
          display: flex; flex-wrap: wrap; gap: var(--space-2);
          margin-bottom: var(--space-6);
        }

        .detail-tag {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          background: var(--color-cream-dark);
          font-size: var(--text-sm);
          color: var(--color-gray-600);
        }

        .qty-selector {
          display: flex; align-items: center; justify-content: space-between;
          border: 1.5px solid var(--color-gray-300); border-radius: var(--radius-full);
          width: 120px; padding: var(--space-1) var(--space-1); margin-bottom: var(--space-4);
        }
        .qty-selector button {
          width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--color-cream);
          cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;
          transition: all var(--transition-fast);
        }
        .qty-selector button:hover:not(:disabled) { background: var(--color-gray-200); }
        .qty-selector button:disabled { opacity: 0.5; cursor: not-allowed; }
        .qty-selector span { font-weight: 600; font-size: var(--text-lg); }

        @media (max-width: 768px) {
          .detail-btn { justify-content: center; }
        }

        .detail-ctas {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .detail-btn { width: 100%; justify-content: center; }

        .btn-added {
          background: linear-gradient(135deg, var(--color-success), #15803D) !important;
        }

        .detail-share { gap: var(--space-2); }

        .share-count {
          font-size: var(--text-xs);
          opacity: 0.8;
          margin-left: var(--space-1);
        }

        .trust-badges {
          display: flex; flex-wrap: wrap; gap: var(--space-2);
        }

        .trust-badge {
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-3);
          background: var(--color-gold-pale);
          border: 1px solid var(--color-gold-light);
          border-radius: var(--radius-full);
          color: var(--color-gray-700);
          font-weight: 500;
        }

        .restock-section { display: flex; flex-direction: column; gap: var(--space-4); }

        .notify-form {
          background: var(--color-cream);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          border: 1px solid var(--color-gold-light);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .notify-form-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-burgundy);
        }

        .notify-msg {
          font-size: var(--text-sm);
          color: var(--color-success);
          font-weight: 500;
        }

        /* ── COUPON WIDGET ───────────────────────────────── */
        .coupon-widget {
          margin-bottom: var(--space-5);
          border: 1px solid var(--color-gold-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(201,148,42,0.03);
        }

        .coupon-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-gold-dark);
          transition: background 0.15s ease;
        }
        .coupon-toggle:hover { background: rgba(201,148,42,0.06); }

        .coupon-toggle-arrow {
          font-size: 1rem;
          transition: transform 0.2s ease;
          display: inline-block;
        }

        .coupon-input-wrap {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--color-gold-light);
          background: white;
        }
        .coupon-input { flex: 1; }

        .coupon-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: rgba(22,163,74,0.06);
          border: none;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-success);
        }

        .coupon-remove {
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--text-xs);
          color: var(--color-error);
          font-weight: 600;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          transition: background 0.15s;
        }
        .coupon-remove:hover { background: var(--color-error-light); }

        .coupon-error {
          font-size: var(--text-xs);
          color: var(--color-error);
          padding: var(--space-2) var(--space-4);
          background: var(--color-error-light);
          margin: 0;
        }
      `}</style>
    </>
  );
}
