'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroStats { totalProducts: number; totalCustomers: number }

const HERITAGE_WORDS = ['Tradition', 'Elegance', 'Heritage', 'Artistry'];

export default function HeroSection({ stats, heroImage = '/images/hero-model.jpg' }: { stats?: HeroStats, heroImage?: string }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  // Rotating heritage word
  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % HERITAGE_WORDS.length);
        setWordVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-label="Hero banner">
      {/* Background Gradients */}
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-bg-pattern" aria-hidden="true" />

      {/* Floating gold dust particles (Left side only) */}
      <div className="hero-particles" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      <div className="container hero-container">
        {/* ── LEFT: TEXT CONTENT ── */}
        <div className="hero-content">
          {/* Top ornamental divider */}
          <div className="hero-ornament animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <span className="hero-ornament-line" />
            <span className="hero-ornament-diamond">✦</span>
            <span className="hero-ornament-line" />
          </div>

          {/* Tagline */}
          <p className="hero-tagline animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            परंपरा &nbsp;✦&nbsp; गुणवत्ता &nbsp;✦&nbsp; सौंदर्य
          </p>

          {/* Main headline */}
          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Wear the Art<br />
            of{' '}
            <span
              className="hero-title-accent"
              style={{ opacity: wordVisible ? 1 : 0, transition: 'opacity 0.35s ease' }}
            >
              {HERITAGE_WORDS[wordIdx]}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            Exquisite handloom cotton sarees crafted by master weavers —
            each thread woven with generations of tradition.
          </p>

          {/* CTA buttons */}
          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <Link href="/collection" className="btn btn-gold btn-lg hero-cta" id="hero-shop-now">
              Explore Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Namaste! I would like to inquire about your handloom saree collection. 🌸')}`}
              className="btn hero-wa-btn btn-lg"
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

          {/* Heritage stats */}
          <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '650ms' }} aria-label="Store statistics">
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
                    <span>Customers</span>
                  </div>
                )}
                <div className="hero-stat">
                  <strong>100%</strong>
                  <span>Pure Cotton</span>
                </div>
              </>
            ) : (
              <>
                <div className="hero-stat"><strong>100%</strong><span>Pure Cotton</span></div>
                <div className="hero-stat"><strong>Authentic</strong><span>Handloom</span></div>
                <div className="hero-stat"><strong>Direct</strong><span>From Weavers</span></div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: VISUAL ATTRACTION ── */}
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="hero-image-wrapper">
            <Image
              src={heroImage}
              alt="Elegant Indian woman wearing a Banarasi handloom saree"
              fill
              priority
              className="hero-image"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Elegant overlay gradient to blend with background */}
            <div className="hero-image-overlay"></div>
          </div>
          
          {/* Trust Badge - Psychological anchor */}
          <div className="hero-trust-badge">
            <div className="hero-trust-icon">✓</div>
            <div className="hero-trust-text">
              <strong>Premium Quality</strong>
              <span>Verified Handloom</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── HERO SHELL ───────────────────────────────────────── */
        .hero {
          position: relative;
          min-height: calc(100dvh - var(--navbar-height));
          display: flex;
          align-items: center;
          overflow: hidden;
          background: linear-gradient(
            160deg,
            #2D0A12 0%,
            #3D1018 30%,
            #4A1520 55%,
            #3A0E16 80%,
            #200810 100%
          );
          padding-top: var(--space-8);
          padding-bottom: var(--space-8);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 15% 60%, rgba(201,148,42,0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, rgba(201,148,42,0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 100%, rgba(90,0,20,0.5) 0%, transparent 60%);
        }

        .hero-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0 L20 0 L20 20 M20 20 L40 20 L40 40' stroke='%23C9942A' stroke-width='0.3' opacity='0.15'/%3E%3Cpath d='M20 0 L40 0 L40 20 M0 20 L0 40 L20 40' stroke='%23C9942A' stroke-width='0.3' opacity='0.08'/%3E%3C/svg%3E");
          opacity: 0.6;
        }

        /* ── GRID LAYOUT ──────────────────────────────────────── */
        .hero-container {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--space-12);
          align-items: center;
          width: 100%;
        }

        /* ── GOLD DUST PARTICLES ──────────────────────────────── */
        .hero-particles { position: absolute; inset: 0; pointer-events: none; width: 50%; }

        .particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--color-gold-shimmer);
          opacity: 0;
          animation: particle-drift 8s ease-in-out infinite;
        }

        .particle-1  { top: 20%; left: 10%;  animation-delay: 0s;    width: 4px; height: 4px; }
        .particle-2  { top: 40%; left: 25%;  animation-delay: 1.2s;  opacity: 0; }
        .particle-3  { top: 15%; left: 55%;  animation-delay: 0.8s;  width: 2px; height: 2px; }
        .particle-4  { top: 70%; left: 15%;  animation-delay: 2s; }
        .particle-5  { top: 30%; right: 20%; animation-delay: 1.5s;  width: 5px; height: 5px; }
        .particle-6  { top: 80%; left: 40%;  animation-delay: 0.5s;  width: 2px; height: 2px; }
        .particle-7  { top: 50%; left: 70%;  animation-delay: 1.8s;  width: 4px; height: 4px; }
        .particle-8  { top: 25%; left: 80%;  animation-delay: 4s;    width: 3px; height: 3px; }

        @keyframes particle-drift {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          10%  { opacity: 0.8; }
          50%  { opacity: 0.5; transform: translateY(-30px) scale(1.2); }
          90%  { opacity: 0; }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }

        /* ── CONTENT (LEFT) ───────────────────────────────────── */
        .hero-content {
          padding-right: var(--space-6);
        }

        .hero-ornament {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .hero-ornament-line {
          flex: 1;
          max-width: 64px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-gold));
        }
        .hero-ornament-line:last-child {
          background: linear-gradient(90deg, var(--color-gold), transparent);
        }
        .hero-ornament-diamond {
          color: var(--color-gold);
          font-size: 1rem;
          line-height: 1;
          animation: pulse 3s ease-in-out infinite;
        }

        .hero-tagline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-base);
          font-style: italic;
          letter-spacing: 0.2em;
          color: var(--color-gold-light);
          margin-bottom: var(--space-4);
          opacity: 0.85;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 1.05;
          color: var(--color-cream);
          margin-bottom: var(--space-4);
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hero-title-accent {
          display: block;
          background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold-shimmer), var(--color-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          min-height: 1.1em;
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          color: rgba(253,246,236,0.7);
          line-height: 1.6;
          margin-bottom: var(--space-6);
          font-style: italic;
          max-width: 520px;
        }

        /* ── CTA ACTIONS ──────────────────────────────────────── */
        .hero-actions {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-bottom: var(--space-8);
        }

        .hero-cta {
          min-width: 220px;
          font-size: var(--text-base) !important;
          padding: var(--space-4) var(--space-8) !important;
          letter-spacing: 0.1em;
        }

        .hero-wa-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: var(--text-base);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 2px;
          padding: var(--space-4) var(--space-8);
          border: 1.5px solid rgba(37,211,102,0.6);
          color: #4ADE80;
          background: rgba(37,211,102,0.08);
          transition: all var(--transition-normal);
          cursor: pointer;
          text-decoration: none;
        }
        .hero-wa-btn:hover {
          background: rgba(37,211,102,0.18);
          border-color: #25D366;
          color: #4ADE80;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(37,211,102,0.25);
        }

        /* ── STATS ────────────────────────────────────────────── */
        .hero-stats {
          display: flex;
          gap: var(--space-8);
          position: relative;
          padding-top: var(--space-5);
        }

        .hero-stats::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 120px; height: 1px;
          background: linear-gradient(90deg, var(--color-gold), transparent);
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
        }

        .hero-stat strong {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--color-gold-light);
          line-height: 1;
        }

        .hero-stat span {
          font-size: var(--text-xs);
          color: rgba(253,246,236,0.5);
          margin-top: 4px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── VISUAL (RIGHT) ───────────────────────────────────── */
        .hero-visual {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          height: 600px;
          border-radius: 140px 140px 12px 12px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border: 1px solid rgba(201,148,42,0.3);
        }

        .hero-image {
          object-fit: cover;
          object-position: center 20%;
        }

        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(32,8,16,0.8) 0%, transparent 40%, rgba(32,8,16,0.1) 100%);
          pointer-events: none;
        }

        /* ── TRUST BADGE ──────────────────────────────────────── */
        .hero-trust-badge {
          position: absolute;
          bottom: 30px;
          left: -30px;
          background: rgba(26, 8, 14, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(201,148,42,0.4);
          padding: 12px 20px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          z-index: 10;
          animation: float 5s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .hero-trust-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-gold);
          color: var(--color-burgundy);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .hero-trust-text {
          display: flex;
          flex-direction: column;
        }

        .hero-trust-text strong {
          color: var(--color-gold-light);
          font-size: var(--text-sm);
          font-family: var(--font-heading);
          letter-spacing: 0.05em;
        }

        .hero-trust-text span {
          color: rgba(253,246,236,0.7);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ── RESPONSIVE ───────────────────────────────────────── */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-8);
          }
          .hero-image-wrapper { height: 500px; border-radius: 100px 100px 12px 12px; }
          .hero-trust-badge { left: -10px; bottom: 20px; padding: 10px 16px; }
        }

        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: var(--space-8);
            text-align: center;
          }
          .hero-content { padding-right: 0; }
          .hero-ornament { justify-content: center; }
          .hero-subtitle { margin-left: auto; margin-right: auto; }
          .hero-actions { flex-direction: column; }
          .hero-cta, .hero-wa-btn { width: 100%; justify-content: center; }
          .hero-stats { justify-content: center; }
          .hero-stats::before { left: 50%; transform: translateX(-50%); background: var(--color-gold); width: 60px; }
          
          /* Visual changes for mobile */
          .hero-visual { min-height: 400px; margin-top: var(--space-4); }
          .hero-image-wrapper { height: 400px; border-radius: 200px 200px 12px 12px; }
          .hero-trust-badge { left: 50%; transform: translateX(-50%); bottom: -20px; width: max-content; }
          @keyframes float { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
        }
      `}</style>
    </section>
  );
}
