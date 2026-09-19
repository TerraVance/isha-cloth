'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { whatsapp, buildAdminOrderMessage, buildCustomerOrderMessage } from '@/lib/whatsapp';

export default function CheckoutPage() {
  const { cart, applyCoupon, removeCoupon, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', pincode: '',
    notes: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = cart.subtotal - (cart.coupon?.discountAmount || 0) >= 999 ? 0 : 99;
  const total = cart.subtotal - (cart.coupon?.discountAmount || 0) + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  // 🔄 Post-Purchase Loop: Coupon validation
  const handleCouponApply = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponStatus(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: cart.subtotal }),
      });
      const json = await res.json();
      if (json.valid) {
        applyCoupon(couponInput.toUpperCase().trim(), json.discountPercent, json.discountAmount);
        setCouponStatus({ valid: true, message: json.message });
      } else {
        setCouponStatus({ valid: false, message: json.reason });
      }
    } catch {
      setCouponStatus({ valid: false, message: 'Could not validate coupon. Try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())   errs.name    = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.address.trim()) errs.address = 'Delivery address is required';
    if (!form.city.trim())    errs.city    = 'City is required';
    if (!/^\d{6}$/.test(form.pincode))    errs.pincode = 'Enter a valid 6-digit pincode';
    if (cart.items.length === 0) errs.cart = 'Your cart is empty';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.items,
          coupon_code: cart.coupon?.code || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrors({ submit: json.error || 'Failed to place order. Try again.' });
        setPlacing(false);
        return;
      }

      // Open WhatsApp to admin automatically
      const adminMsg = buildAdminOrderMessage({
        orderId: json.orderId,
        customerName: form.name,
        customerPhone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        items: cart.items,
        subtotal: cart.subtotal,
        discountAmount: cart.coupon?.discountAmount || 0,
        shipping,
        total: json.total,
        couponCode: cart.coupon?.code,
      });

      const adminUrl = whatsapp.toAdmin(adminMsg);
      window.open(adminUrl, '_blank');

      clearCart();
      router.push(`/order-confirmation?orderId=${json.orderId}&total=${json.total}&coupon=${json.couponCode || ''}`);
    } catch {
      setErrors({ submit: 'Network error. Please check your connection.' });
      setPlacing(false);
    }
  };

  if (cart.items.length === 0 && !placing) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)' }}>Your cart is empty</h2>
          <a href="/collection" className="btn btn-primary btn-lg" style={{ marginTop: '2rem', display: 'inline-flex' }}>
            Browse Sarees
          </a>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container checkout-container">
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-layout">
            {/* === Left: Form === */}
            <div className="checkout-form-wrap">
              {/* Delivery Details */}
              <section className="checkout-section" aria-labelledby="delivery-heading">
                <h2 className="checkout-section-title" id="delivery-heading">📍 Delivery Details</h2>
                <div className="form-grid">
                  <div className="input-group form-full">
                    <label className="input-label" htmlFor="name">Full Name *</label>
                    <input id="name" name="name" className={`input${errors.name ? ' error' : ''}`} placeholder="Your full name" value={form.name} onChange={handleChange} autoComplete="name" />
                    {errors.name && <span className="input-error-msg">{errors.name}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="phone">WhatsApp Number *</label>
                    <input id="phone" name="phone" type="tel" className={`input${errors.phone ? ' error' : ''}`} placeholder="10-digit mobile" value={form.phone} onChange={handleChange} maxLength={10} autoComplete="tel" />
                    {errors.phone && <span className="input-error-msg">{errors.phone}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="email">Email (optional)</label>
                    <input id="email" name="email" type="email" className="input" placeholder="your@email.com" value={form.email} onChange={handleChange} autoComplete="email" />
                  </div>

                  <div className="input-group form-full">
                    <label className="input-label" htmlFor="address">Full Address *</label>
                    <textarea id="address" name="address" className={`input${errors.address ? ' error' : ''}`} placeholder="House/flat no., street, area…" value={form.address} onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>} rows={3} style={{ resize: 'none' }} autoComplete="street-address" />
                    {errors.address && <span className="input-error-msg">{errors.address}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="city">City *</label>
                    <input id="city" name="city" className={`input${errors.city ? ' error' : ''}`} placeholder="City" value={form.city} onChange={handleChange} autoComplete="address-level2" />
                    {errors.city && <span className="input-error-msg">{errors.city}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="pincode">Pincode *</label>
                    <input id="pincode" name="pincode" className={`input${errors.pincode ? ' error' : ''}`} placeholder="6-digit pincode" value={form.pincode} onChange={handleChange} maxLength={6} autoComplete="postal-code" />
                    {errors.pincode && <span className="input-error-msg">{errors.pincode}</span>}
                  </div>

                  <div className="input-group form-full">
                    <label className="input-label" htmlFor="notes">Order Notes (optional)</label>
                    <textarea id="notes" name="notes" className="input" placeholder="Any special instructions…" value={form.notes} onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>} rows={2} style={{ resize: 'none' }} />
                  </div>
                </div>
              </section>

              {/* 🔄 Post-Purchase Loop: Coupon Section */}
              <section className="checkout-section coupon-section" aria-labelledby="coupon-heading">
                <h2 className="checkout-section-title" id="coupon-heading">🎟️ Have a Coupon?</h2>
                {cart.coupon ? (
                  <div className="coupon-applied">
                    <div className="coupon-applied-info">
                      <span>🎉 <strong>{cart.coupon.code}</strong> applied!</span>
                      <span className="coupon-save">You save ₹{cart.coupon.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="coupon-remove" onClick={removeCoupon} aria-label="Remove coupon">
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter coupon code (e.g. ISHA10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleCouponApply()}
                      id="coupon-input"
                    />
                    <button
                      className="btn btn-outline btn-md"
                      onClick={handleCouponApply}
                      disabled={couponLoading || !couponInput.trim()}
                      id="coupon-apply"
                    >
                      {couponLoading ? <span className="spinner dark" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {couponStatus && !cart.coupon && (
                  <p className={`coupon-msg${couponStatus.valid ? ' valid' : ' invalid'}`}>
                    {couponStatus.message}
                  </p>
                )}
              </section>

              {/* Payment info */}
              <section className="checkout-section payment-info" aria-label="Payment information">
                <h2 className="checkout-section-title">💳 Payment Method</h2>
                <div className="payment-card">
                  <span>📱</span>
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay when your saree arrives at your doorstep. You will get an order confirmation on WhatsApp.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* === Right: Order Summary === */}
            <div className="checkout-summary">
              <h2 className="checkout-section-title">🛒 Order Summary</h2>

              <div className="checkout-items">
                {cart.items.map(item => (
                  <div key={item.productId} className="checkout-item">
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">× {item.quantity}</span>
                    </div>
                    <span className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {cart.coupon && (
                  <div className="summary-row summary-discount">
                    <span>Discount ({cart.coupon.code})</span>
                    <span>−₹{cart.coupon.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {errors.submit && (
                <div className="checkout-error">{errors.submit}</div>
              )}

              <button
                className="btn btn-primary btn-lg place-order-btn"
                onClick={handlePlaceOrder}
                disabled={placing}
                id="place-order-btn"
              >
                {placing ? (
                  <><span className="spinner" /> Placing Order…</>
                ) : (
                  <>
                    🛍️ Place Order
                    <span style={{ opacity: 0.8, fontSize: 'var(--text-sm)' }}>
                      (WhatsApp confirmation)
                    </span>
                  </>
                )}
              </button>

              <p className="checkout-note">
                By placing your order, you agree to receive an order confirmation on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .checkout-container { padding-top: var(--space-10); padding-bottom: var(--space-16); }

        .checkout-title {
          font-family: var(--font-heading);
          font-size: var(--text-4xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-8);
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-10);
          align-items: start;
        }
        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr; }
        }

        .checkout-section {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-7);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-100);
          margin-bottom: var(--space-5);
        }

        .checkout-section-title {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-5);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        .form-full { grid-column: 1 / -1; }

        /* Coupon */
        .coupon-input-row { display: flex; gap: var(--space-3); }
        .coupon-input-row .input { flex: 1; }

        .coupon-applied {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--color-success-light);
          border: 1px solid var(--color-success);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
        }
        .coupon-applied-info { display: flex; flex-direction: column; gap: 2px; }
        .coupon-save { font-size: var(--text-sm); color: var(--color-success); }
        .coupon-remove { font-size: var(--text-sm); color: var(--color-error); cursor: pointer; }
        .coupon-remove:hover { text-decoration: underline; }

        .coupon-msg { font-size: var(--text-sm); margin-top: var(--space-2); font-weight: 500; }
        .coupon-msg.valid { color: var(--color-success); }
        .coupon-msg.invalid { color: var(--color-error); }

        /* Payment card */
        .payment-card {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          background: var(--color-cream);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          font-size: 2rem;
        }
        .payment-card div { display: flex; flex-direction: column; gap: var(--space-1); }
        .payment-card p { font-size: var(--text-sm); color: var(--color-gray-500); }

        /* Summary panel */
        .checkout-summary {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray-100);
          position: sticky;
          top: calc(var(--navbar-height) + var(--space-4));
        }

        .checkout-items {
          display: flex; flex-direction: column; gap: var(--space-3);
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-5);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          font-size: var(--text-sm);
        }
        .checkout-item-info { display: flex; gap: var(--space-2); align-items: baseline; flex: 1; }
        .checkout-item-name { font-weight: 500; color: var(--color-charcoal); }
        .checkout-item-qty { color: var(--color-gray-400); white-space: nowrap; }
        .checkout-item-price { font-weight: 600; color: var(--color-maroon); white-space: nowrap; }

        .checkout-totals { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-6); }

        .checkout-error {
          background: var(--color-error-light);
          color: var(--color-error);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          margin-bottom: var(--space-4);
          border: 1px solid var(--color-error);
        }

        .place-order-btn {
          width: 100%;
          justify-content: center;
          flex-direction: column;
          gap: var(--space-1);
          padding: var(--space-5);
          font-size: var(--text-lg);
        }

        .checkout-note {
          font-size: var(--text-xs);
          color: var(--color-gray-400);
          text-align: center;
          margin-top: var(--space-3);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}
