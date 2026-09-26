'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/collection', label: 'Collection' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { cart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(cart.totalItems);

  // Shrink navbar on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bounce cart icon when item added
  useEffect(() => {
    if (cart.totalItems > prevCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    prevCount.current = cart.totalItems;
  }, [cart.totalItems]);

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} role="navigation" aria-label="Main navigation" id="main-nav">
        {/* Gold top border — only visible when scrolled */}
        <div className="navbar-gold-rule" aria-hidden="true" />

        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href="/" className="navbar-logo" aria-label="Isha Vastram Home">
              <Image
                src="/images/logo.png"
                alt="Isha Vastram"
                width={80}
                height={120}
                priority
                className="navbar-logo-img"
              />
            </Link>

            {/* Desktop Nav Links */}
            <ul className="navbar-links hide-mobile" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="navbar-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Side Actions */}
            <div className="navbar-actions">
              {/* Cart Button — icon + label + count */}
              <Link
                href="/cart"
                className={`cart-btn${cartBounce ? ' cart-bounce' : ''}`}
                aria-label={`Shopping cart — ${cart.totalItems} items`}
                id="navbar-cart-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="cart-label">Cart</span>
                <span className={`cart-count${cart.totalItems > 0 ? ' cart-count-visible' : ''}`} aria-live="polite">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              </Link>

              {/* Mobile hamburger */}
              <button
                className="hamburger hide-desktop"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
                id="hamburger-btn"
              >
                <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
                <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
                <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          id="mobile-menu"
          className={`mobile-menu${menuOpen ? ' mobile-menu-open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <ul role="list">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="mobile-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <style>{`
        /* ── NAVBAR SHELL ─────────────────────────────────────── */
        .navbar {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          background: rgba(26, 8, 14, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(201,148,42,0.15);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          padding: 0;
        }

        /* Gold hairline top rule (always visible) */
        .navbar-gold-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
          opacity: 0.5;
          transition: opacity 0.4s ease;
        }

        .navbar-scrolled {
          background: rgba(26, 8, 14, 0.97);
          border-bottom-color: rgba(201,148,42,0.3);
          box-shadow: 0 4px 40px rgba(0,0,0,0.5);
        }

        .navbar-scrolled .navbar-gold-rule {
          opacity: 1;
        }

        /* ── INNER LAYOUT ─────────────────────────────────────── */
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--navbar-height);
          gap: var(--space-4);
        }

        /* ── LOGO ─────────────────────────────────────────────── */
        .navbar-logo { display: flex; align-items: center; flex-shrink: 0; }
        .navbar-logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          transition: all var(--transition-normal);
        }
        .navbar-scrolled .navbar-logo-img {
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .navbar-logo:hover .navbar-logo-img { transform: scale(1.04); }

        /* ── NAV LINKS ────────────────────────────────────────── */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-10);
        }

        .navbar-link {
          font-family: 'Inter', sans-serif;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(253,246,236,0.75);
          position: relative;
          padding: var(--space-2) 0;
          transition: color var(--transition-fast);
        }

        /* When scrolled: inherit cream on dark bg */
        .navbar-scrolled .navbar-link {
          color: rgba(232,201,122,0.75);
        }

        /* Animated underline */
        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--color-gold), var(--color-gold-shimmer));
          transition: width var(--transition-normal);
          border-radius: var(--radius-full);
        }

        .navbar-link:hover { color: var(--color-gold-light); }
        .navbar-link:hover::after { width: 100%; }
        .navbar-scrolled .navbar-link:hover { color: var(--color-gold-shimmer); }

        /* ── ACTIONS ──────────────────────────────────────────── */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        /* ── CART BUTTON ──────────────────────────────────────── */
        .cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px 6px 10px;
          border-radius: var(--radius-full);
          color: var(--color-cream);
          border: 1px solid rgba(201,148,42,0.35);
          background: rgba(201,148,42,0.1);
          font-size: var(--text-sm);
          font-weight: 600;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .navbar-scrolled .cart-btn {
          color: var(--color-gold-light);
          border-color: rgba(201,148,42,0.5);
          background: rgba(201,148,42,0.12);
        }

        .cart-btn:hover {
          background: rgba(201,148,42,0.22);
          color: var(--color-gold-shimmer);
          border-color: rgba(201,148,42,0.6);
          transform: translateY(-1px);
        }

        .cart-label {
          letter-spacing: 0.04em;
        }

        .cart-btn.cart-bounce {
          animation: bounce-cart 0.6s var(--ease-out);
        }

        .cart-count {
          background: var(--color-maroon);
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1.5px solid rgba(201,148,42,0.5);
          opacity: 0;
          transform: scale(0.6);
          transition: all 0.2s ease;
        }

        .cart-count-visible {
          opacity: 1;
          transform: scale(1);
          background: var(--color-gold);
          color: var(--color-burgundy);
          animation: pulse 0.3s ease;
        }

        /* ── HAMBURGER ────────────────────────────────────────── */
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          transition: background var(--transition-fast);
        }
        .hamburger:hover { background: rgba(201,148,42,0.1); }

        .hamburger-line {
          display: block;
          width: 22px;
          height: 1.5px;
          background: rgba(253,246,236,0.8);
          border-radius: var(--radius-full);
          transition: all var(--transition-normal);
          transform-origin: center;
        }

        .navbar-scrolled .hamburger-line {
          background: var(--color-gold-light);
        }

        .hamburger-line.open:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger-line.open:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── MOBILE MENU ──────────────────────────────────────── */
        .mobile-menu {
          background: rgba(26, 8, 14, 0.98);
          border-top: 1px solid rgba(201,148,42,0.2);
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--transition-normal);
        }

        .mobile-menu.mobile-menu-open { max-height: 320px; }

        .mobile-menu-link {
          display: block;
          padding: var(--space-4) var(--space-6);
          font-family: 'Inter', sans-serif;
          font-size: var(--text-sm);
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,201,122,0.7);
          border-bottom: 1px solid rgba(201,148,42,0.1);
          transition: all var(--transition-fast);
        }

        .mobile-menu-link:hover {
          background: rgba(201,148,42,0.08);
          color: var(--color-gold-shimmer);
          padding-left: var(--space-10);
        }
      `}</style>
    </>
  );
}
