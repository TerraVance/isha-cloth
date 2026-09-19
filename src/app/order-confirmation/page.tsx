'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { buildShareCouponMessage } from '@/lib/whatsapp';

export default function OrderConfirmationPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId') || '';
  const total = params.get('total') || '0';
  const couponCode = params.get('coupon') || 'ISHA10';

  const shareMessage = buildShareCouponMessage({ couponCode });
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const copyCode = () => {
    navigator.clipboard.writeText(couponCode).catch(() => {});
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="container confirm-container">

          {/* Success Banner */}
          <div className="confirm-banner animate-fade-in-up">
            <div className="confirm-check">✅</div>
            <h1 className="confirm-title">Order Placed!</h1>
            <p className="confirm-subtitle">
              Your order <strong>{orderId}</strong> has been received.
              <br />
              We&apos;ll send you a WhatsApp confirmation shortly! 🌸
            </p>
            <div className="confirm-total">
              Total: <strong>₹{parseInt(total).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* 🔄 Post-Purchase Loop: Share Coupon Card */}
          <div className="coupon-card animate-fade-in-up" style={{ animationDelay: '200ms', maxWidth: 560, margin: '0 auto' }}>
            <p className="coupon-card-label">🎁 Your Next Order Gift</p>
            <p className="coupon-card-title">Share &amp; Save!</p>
            <p className="coupon-card-desc">
              Here&apos;s a coupon for your next order — and to share with friends!
            </p>
            <div className="coupon-code" onClick={copyCode} title="Click to copy" role="button" tabIndex={0} aria-label="Copy coupon code" style={{ cursor: 'pointer' }}>
              {couponCode}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-5)' }}>
              10% off on your next order (min ₹500). Tap code to copy!
            </p>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              id="share-coupon-whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share with Friends on WhatsApp 🎁
            </a>
          </div>

          {/* Next Steps */}
          <div className="confirm-steps animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <h2 className="confirm-steps-title">What Happens Next?</h2>
            <div className="steps-grid">
              {[
                { icon: '📱', step: '1', title: 'WhatsApp Confirmation', desc: 'You\'ll receive an order confirmation on WhatsApp within minutes.' },
                { icon: '✅', step: '2', title: 'We Confirm Your Order', desc: 'Our team verifies availability and confirms your order.' },
                { icon: '🚚', step: '3', title: 'Shipped & Tracked', desc: 'Your saree is packed and dispatched. We\'ll update you on WhatsApp.' },
                { icon: '🎉', step: '4', title: 'Delivered!', desc: 'Your beautiful saree arrives at your doorstep. Enjoy!' },
              ].map(s => (
                <div key={s.step} className="step-card">
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-num">Step {s.step}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link href="/collection" className="btn btn-outline btn-lg" id="continue-shopping-confirm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .confirm-container {
          padding-top: var(--space-12);
          padding-bottom: var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-10);
        }

        .confirm-banner {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .confirm-check { font-size: 4rem; margin-bottom: var(--space-4); }

        .confirm-title {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-4);
        }

        .confirm-subtitle {
          font-size: var(--text-lg);
          color: var(--color-gray-600);
          line-height: 1.7;
          margin-bottom: var(--space-4);
        }

        .confirm-total {
          font-size: var(--text-xl);
          color: var(--color-gray-700);
        }
        .confirm-total strong {
          color: var(--color-maroon);
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
        }

        .coupon-card-label {
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--color-gold-dark);
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        .coupon-card-title {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-2);
        }

        .coupon-card-desc {
          font-size: var(--text-base);
          color: var(--color-gray-600);
          margin-bottom: var(--space-4);
        }

        .confirm-steps { max-width: 900px; margin: 0 auto; text-align: center; }

        .confirm-steps-title {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-8);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
        }
        @media (max-width: 768px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr; } }

        .step-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-100);
          text-align: center;
        }

        .step-icon { font-size: 2.5rem; margin-bottom: var(--space-3); }

        .step-num {
          font-size: var(--text-xs);
          color: var(--color-gold-dark);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        .step-title {
          font-family: var(--font-heading);
          font-size: var(--text-base);
          color: var(--color-burgundy);
          margin-bottom: var(--space-2);
        }

        .step-desc { font-size: var(--text-sm); color: var(--color-gray-500); line-height: 1.6; }
      `}</style>
    </>
  );
}
