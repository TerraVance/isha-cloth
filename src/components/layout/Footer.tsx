import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/collection', label: 'Collection' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const CATEGORIES = [
  { href: '/collection?category=Cotton', label: 'Cotton Sarees' },
  { href: '/collection?category=Silk', label: 'Silk Sarees' },
  { href: '/collection?category=Banarasi', label: 'Banarasi Sarees' },
  { href: '/collection?category=Paithani', label: 'Paithani Sarees' },
  { href: '/collection?featured=true', label: 'Featured' },
];

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919209337387';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Image
                src="/images/logo.png"
                alt="Isha Vastram"
                width={140}
                height={56}
                className="footer-logo"
              />
              <p className="footer-tagline">
                शुद्ध कापसाच्या साड्यांचे विशेष घर
              </p>
              <p className="footer-desc">
                Authentic handloom sarees crafted with love and tradition.
                Experience the beauty of pure cotton, delivered to your doorstep.
              </p>
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}`}
                className="btn btn-whatsapp btn-sm footer-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h3 className="footer-col-title">Quick Links</h3>
              <ul role="list">
                {QUICK_LINKS.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-col">
              <h3 className="footer-col-title">Shop By</h3>
              <ul role="list">
                {CATEGORIES.map(cat => (
                  <li key={cat.href}>
                    <Link href={cat.href} className="footer-link">{cat.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h3 className="footer-col-title">Contact Us</h3>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.72-.72a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                  <a href="tel:+919876543210" className="footer-link">+91 98765 43210</a>
                </div>
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:hello@ishavastram.com" className="footer-link">hello@ishavastram.com</a>
                </div>
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Pune, Maharashtra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© {year} Isha Vastram. All rights reserved.</p>
            <p className="footer-bottom-right">Made with ❤️ in India</p>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: linear-gradient(180deg, var(--color-burgundy) 0%, var(--color-ink) 100%);
          color: rgba(253,246,236,0.7);
          margin-top: auto;
          border-top: 1px solid rgba(201,148,42,0.25);
          position: relative;
          overflow: hidden;
        }

        /* Subtle textile pattern overlay */
        .footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: var(--texture-damask);
          opacity: 0.3;
          pointer-events: none;
        }

        .footer-main {
          padding: var(--space-16) 0 var(--space-12);
          position: relative;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
          gap: var(--space-12);
        }

        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: var(--space-8); }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: var(--space-8); }
        }

        .footer-logo { filter: brightness(0) invert(1); opacity: 0.85; }

        .footer-tagline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          color: var(--color-gold-light);
          margin: var(--space-3) 0 var(--space-2);
          font-size: var(--text-base);
          letter-spacing: 0.05em;
        }

        .footer-desc {
          font-size: var(--text-sm);
          line-height: 1.7;
          margin-bottom: var(--space-5);
          opacity: 0.8;
        }

        .footer-whatsapp { margin-top: var(--space-2); width: fit-content; }

        .footer-col-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-xl);
          color: var(--color-gold-light);
          font-weight: 600;
          margin-bottom: var(--space-5);
          letter-spacing: 0.05em;
        }

        .footer-link {
          display: block;
          font-size: var(--text-sm);
          color: rgba(253,246,236,0.6);
          padding: var(--space-1) 0;
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .footer-link:hover {
          color: var(--color-gold-light);
          padding-left: var(--space-2);
        }

        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.7);
        }

        .footer-contact-item svg { flex-shrink: 0; margin-top: 2px; opacity: 0.7; }

        .footer-bottom {
          border-top: 1px solid rgba(201,148,42,0.15);
          padding: var(--space-5) 0;
          position: relative;
        }

        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--text-sm);
          opacity: 0.6;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
      `}</style>
    </footer>
  );
}
