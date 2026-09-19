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
    const sentinel = document.getElementById('navbar-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
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
      <div id="navbar-sentinel" style={{ height: 1, position: 'absolute', top: 0 }} aria-hidden="true" />
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href="/" className="navbar-logo" aria-label="Isha Vastram Home">
              <Image
                src="/images/logo.png"
                alt="Isha Vastram"
                width={120}
                height={48}
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
              {/* Cart Icon */}
              <Link
                href="/cart"
                className={`cart-btn${cartBounce ? ' cart-bounce' : ''}`}
                aria-label={`Shopping cart — ${cart.totalItems} items`}
                id="navbar-cart-btn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {cart.totalItems > 0 && (
                  <span className="cart-count" aria-live="polite">
                    {cart.totalItems > 99 ? '99+' : cart.totalItems}
                  </span>
                )}
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
        .navbar {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          background: rgba(255, 248, 240, 0.85);
          border-bottom: 1px solid transparent;
          transition: all var(--transition-normal);
          padding: 0;
        }

        .navbar-scrolled {
          background: rgba(255, 248, 240, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom-color: var(--color-gold-light);
          box-shadow: 0 2px 20px rgba(128, 0, 32, 0.08);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--navbar-height);
          gap: var(--space-4);
        }

        .navbar-logo { display: flex; align-items: center; flex-shrink: 0; }
        .navbar-logo-img {
          height: 44px;
          width: auto;
          object-fit: contain;
          transition: transform var(--transition-fast);
        }
        .navbar-logo:hover .navbar-logo-img { transform: scale(1.03); }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .navbar-link {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--color-charcoal);
          position: relative;
          padding: var(--space-1) 0;
          transition: color var(--transition-fast);
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--color-maroon), var(--color-gold));
          transition: width var(--transition-normal);
          border-radius: var(--radius-full);
        }

        .navbar-link:hover { color: var(--color-maroon); }
        .navbar-link:hover::after { width: 100%; }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          color: var(--color-charcoal);
          transition: all var(--transition-fast);
        }

        .cart-btn:hover {
          background: var(--color-cream-dark);
          color: var(--color-maroon);
        }

        .cart-btn.cart-bounce {
          animation: bounce-cart 0.6s var(--ease-out);
        }

        .cart-count {
          position: absolute;
          top: 4px;
          right: 4px;
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
          animation: pulse 0.3s ease;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }
        .hamburger:hover { background: var(--color-cream-dark); }

        .hamburger-line {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--color-charcoal);
          border-radius: var(--radius-full);
          transition: all var(--transition-normal);
          transform-origin: center;
        }

        .hamburger-line.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger-line.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mobile-menu {
          background: var(--color-cream);
          border-top: 1px solid var(--color-gold-light);
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--transition-normal);
        }

        .mobile-menu.mobile-menu-open { max-height: 300px; }

        .mobile-menu-link {
          display: block;
          padding: var(--space-4) var(--space-6);
          font-size: var(--text-lg);
          font-weight: 500;
          color: var(--color-charcoal);
          border-bottom: 1px solid var(--color-cream-dark);
          transition: all var(--transition-fast);
        }

        .mobile-menu-link:hover {
          background: var(--color-cream-dark);
          color: var(--color-maroon);
          padding-left: var(--space-8);
        }
      `}</style>
    </>
  );
}
