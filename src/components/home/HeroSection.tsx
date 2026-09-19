'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeroStats { totalProducts: number; totalCustomers: number }

export default function HeroSection({ stats }: { stats?: HeroStats }) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      el.style.setProperty('--parallax-y', `${scrollY * 0.4}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-label="Hero banner">
      {/* Background gradient overlay */}
      <div className="hero-bg" aria-hidden="true" />

      {/* Decorative floating petals */}
      <div className="hero-petals" aria-hidden="true">
        {['🌸', '✨', '🌺', '💫', '🌸'].map((p, i) => (
          <span key={i} className={`petal petal-${i + 1}`}>{p}</span>
        ))}
      </div>

      <div className="container hero-content">
        <div className="hero-text animate-fade-in-up">
          <p className="hero-tagline">Pure Cotton • Handloom Crafted</p>
          <h1 className="hero-title">
            Wear the Art of
            <span className="hero-title-accent"> India</span>
          </h1>
          <p className="hero-subtitle">
            Discover our exquisite collection of authentic handloom sarees —<br className="hide-mobile" />
            crafted with love, tradition, and the finest cotton.
          </p>
          <div className="hero-actions">
            <Link href="/collection" className="btn btn-gold btn-lg hero-cta" id="hero-shop-now">
              Explore Collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Hi! I would like to inquire about your saree collection. 🌸')}`}
              className="btn btn-outline btn-lg hero-wa"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask on WhatsApp
            </a>
          </div>
          <div className="hero-stats" aria-label="Store statistics">
            {(stats && (stats.totalProducts > 0 || stats.totalCustomers > 0)) ? (
              <>
                {stats.totalProducts > 0 && (
                  <div className="hero-stat">
                    <strong>{stats.totalProducts}+</strong>
                    <span>Sarees</span>
                  </div>
                )}
                {stats.totalCustomers > 0 && (
                  <div className="hero-stat">
                    <strong>{stats.totalCustomers}+</strong>
                    <span>Happy Customers</span>
                  </div>
                )}
                <div className="hero-stat">
                  <strong>100%</strong>
                  <span>Pure Cotton</span>
                </div>
              </>
            ) : (
              <>
                <div className="hero-stat">
                  <strong>100%</strong>
                  <span>Pure Cotton</span>
                </div>
                <div className="hero-stat">
                  <strong>100%</strong>
                  <span>Handloom</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-line" />
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(128,0,32,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(212,165,55,0.1) 0%, transparent 50%),
            linear-gradient(135deg, var(--color-cream) 0%, #FFF0E8 50%, var(--color-cream-dark) 100%);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A537' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          transform: translateY(var(--parallax-y, 0));
        }

        .hero-petals {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .petal {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.3;
          animation: petal-float 6s ease-in-out infinite;
        }
        .petal-1 { top: 15%; left: 8%;  animation-delay: 0s; font-size: 1.2rem; }
        .petal-2 { top: 25%; right: 12%; animation-delay: 1s; font-size: 2rem; opacity: 0.15; }
        .petal-3 { top: 65%; left: 15%; animation-delay: 2s; }
        .petal-4 { top: 40%; right: 8%;  animation-delay: 3s; font-size: 1rem; }
        .petal-5 { top: 80%; right: 20%; animation-delay: 1.5s; font-size: 1.8rem; opacity: 0.2; }

        @keyframes petal-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(10deg); }
          66%       { transform: translateY(-6px) rotate(-5deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          padding-top: var(--space-12);
          padding-bottom: var(--space-12);
        }

        .hero-text {
          max-width: 680px;
        }

        .hero-tagline {
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-gold-dark);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .hero-tagline::before {
          content: '';
          width: 32px;
          height: 2px;
          background: var(--color-gold);
          border-radius: var(--radius-full);
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: clamp(3rem, 8vw, 5.5rem);
          line-height: 1.05;
          color: var(--color-burgundy);
          margin-bottom: var(--space-5);
          font-weight: 700;
        }

        .hero-title-accent {
          background: linear-gradient(135deg, var(--color-maroon), var(--color-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }

        .hero-subtitle {
          font-size: var(--text-xl);
          color: var(--color-gray-600);
          line-height: 1.7;
          margin-bottom: var(--space-8);
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-bottom: var(--space-10);
        }

        .hero-cta { min-width: 200px; }
        .hero-wa  {
          border-color: #25D366;
          color: #25D366;
        }
        .hero-wa:hover { background: #25D366; color: white; }

        .hero-stats {
          display: flex;
          gap: var(--space-8);
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
        }

        .hero-stat strong {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-maroon);
          line-height: 1;
        }

        .hero-stat span {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          margin-top: 2px;
        }

        .hero-scroll {
          position: absolute;
          bottom: var(--space-8);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .hero-scroll-line {
          width: 2px;
          height: 48px;
          background: linear-gradient(to bottom, var(--color-gold), transparent);
          animation: scroll-line 2s ease-in-out infinite;
        }

        @keyframes scroll-line {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; }
          100% { transform: scaleY(1); opacity: 0; }
        }

        @media (max-width: 768px) {
          .hero { min-height: 80vh; }
          .hero-subtitle { font-size: var(--text-lg); }
          .hero-stats { gap: var(--space-6); }
          .hero-actions { flex-direction: column; }
          .hero-cta, .hero-wa { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
