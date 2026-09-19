'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const isEmpty = cart.items.length === 0;
  const shipping = cart.subtotal - (cart.coupon?.discountAmount || 0) >= 999 ? 0 : 99;

  return (
    <>
      <Navbar />
      <main>
        <div className="container cart-container">
          <h1 className="cart-title">Your Cart</h1>

          {isEmpty ? (
            <div className="cart-empty">
              <span aria-hidden="true">🛒</span>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven&apos;t added any sarees yet.</p>
              <Link href="/collection" className="btn btn-primary btn-lg">
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Items */}
              <div className="cart-items">
                {cart.items.map(item => (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-image">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="100px" />
                      ) : (
                        <span>🌸</span>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <Link href={`/saree/${item.productId}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>

                      <div className="cart-item-controls">
                        <div className="qty-control">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="qty-btn"
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >−</button>
                          <span className="qty-value" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="qty-btn"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= item.stock}
                          >+</button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="cart-item-remove"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-subtotal">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <h2 className="cart-summary-title">Order Summary</h2>

                <div className="cart-summary-rows">
                  <div className="summary-row">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {cart.coupon && (
                    <div className="summary-row summary-discount">
                      <span>🎟️ {cart.coupon.code} ({cart.coupon.discountPercent}% off)</span>
                      <span>−₹{cart.coupon.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE</strong> : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="free-shipping-tip">
                      Add ₹{(999 - (cart.subtotal - (cart.coupon?.discountAmount || 0))).toLocaleString('en-IN')} more for free shipping!
                    </p>
                  )}
                  <div className="summary-divider" />
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <span>₹{cart.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link href="/checkout" className="btn btn-primary btn-lg checkout-btn" id="proceed-to-checkout">
                  Proceed to Checkout
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>

                <Link href="/collection" className="btn btn-ghost btn-md continue-shopping">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        .cart-container {
          padding-top: var(--space-10);
          padding-bottom: var(--space-16);
          min-height: 70vh;
        }

        .cart-title {
          font-family: var(--font-heading);
          font-size: var(--text-4xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-8);
        }

        .cart-empty {
          text-align: center;
          padding: var(--space-24) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }
        .cart-empty span { font-size: 5rem; }
        .cart-empty h2 { font-family: var(--font-heading); color: var(--color-burgundy); }
        .cart-empty p  { color: var(--color-gray-500); }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-10);
          align-items: start;
        }
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
        }

        .cart-items { display: flex; flex-direction: column; gap: var(--space-4); }

        .cart-item {
          display: flex;
          gap: var(--space-5);
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-100);
          align-items: center;
        }

        .cart-item-image {
          position: relative;
          width: 100px;
          height: 130px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-cream);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
        }

        .cart-item-info { flex: 1; min-width: 0; }

        .cart-item-name {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          color: var(--color-burgundy);
          font-weight: 600;
          display: block;
          margin-bottom: var(--space-1);
          text-decoration: none;
        }
        .cart-item-name:hover { color: var(--color-maroon); }

        .cart-item-price {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          margin-bottom: var(--space-3);
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          flex-wrap: wrap;
        }

        .qty-control {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .qty-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-lg);
          color: var(--color-charcoal);
          transition: background var(--transition-fast);
          cursor: pointer;
        }
        .qty-btn:hover:not(:disabled) { background: var(--color-gray-100); }
        .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .qty-value {
          width: 40px;
          text-align: center;
          font-weight: 600;
          font-size: var(--text-base);
          border-left: 1.5px solid var(--color-gray-300);
          border-right: 1.5px solid var(--color-gray-300);
          line-height: 36px;
        }

        .cart-item-remove {
          font-size: var(--text-sm);
          color: var(--color-error);
          cursor: pointer;
          text-decoration: underline;
          transition: opacity var(--transition-fast);
        }
        .cart-item-remove:hover { opacity: 0.7; }

        .cart-item-subtotal {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-maroon);
          flex-shrink: 0;
          min-width: 80px;
          text-align: right;
        }

        .cart-summary {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray-100);
          position: sticky;
          top: calc(var(--navbar-height) + var(--space-4));
        }

        .cart-summary-title {
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-6);
        }

        .cart-summary-rows { display: flex; flex-direction: column; gap: var(--space-4); }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }

        .summary-discount { color: var(--color-success); font-weight: 500; }

        .free-shipping-tip {
          font-size: var(--text-xs);
          color: var(--color-warning);
          text-align: center;
          background: var(--color-warning-light);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
        }

        .summary-divider {
          border-top: 1px dashed var(--color-gray-200);
          margin: var(--space-2) 0;
        }

        .summary-total {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-charcoal);
        }

        .checkout-btn {
          width: 100%; justify-content: center;
          margin-top: var(--space-6);
        }

        .continue-shopping {
          width: 100%;
          justify-content: center;
          margin-top: var(--space-2);
        }
      `}</style>
    </>
  );
}
