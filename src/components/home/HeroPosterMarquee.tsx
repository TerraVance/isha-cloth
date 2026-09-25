'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Poster {
  id: string;
  image_url: string;
  title?: string | null;
  product: { id: string; name: string; images: string[] } | null;
}

interface HeroPosterMarqueeProps {
  posters: Poster[];
}

export default function HeroPosterMarquee({ posters }: HeroPosterMarqueeProps) {
  if (!posters || posters.length === 0) return null;

  // Duplicate the list to create seamless infinite scroll
  const doubled = [...posters, ...posters];

  return (
    <div className="marquee-section" aria-label="Saree collection showcase">
      {/* Top gold rule */}
      <div className="marquee-gold-rule" aria-hidden="true" />

      <div className="marquee-label" aria-hidden="true">
        <span>✦</span>
        <span>Our Collection</span>
        <span>✦</span>
      </div>

      {/* Scrolling track */}
      <div className="marquee-outer">
        <div
          className="marquee-track"
          style={{ '--marquee-count': String(posters.length) } as React.CSSProperties}
          role="list"
          aria-label="Scrolling saree posters"
        >
          {doubled.map((poster, i) => {
            const href = poster.product
              ? `/saree/${poster.product.id}`
              : '/collection';

            return (
              <Link
                key={`${poster.id}-${i}`}
                href={href}
                className="marquee-card"
                role="listitem"
                aria-label={poster.title || poster.product?.name || 'View saree'}
                tabIndex={i >= posters.length ? -1 : 0}
              >
                <div className="marquee-card-img-wrap">
                  {poster.image_url ? (
                    <Image
                      src={poster.image_url}
                      alt={poster.title || poster.product?.name || 'Saree'}
                      fill
                      sizes="(max-width: 768px) 160px, 220px"
                      style={{ objectFit: 'cover' }}
                      className="marquee-card-img"
                    />
                  ) : (
                    <div className="marquee-card-placeholder">🌸</div>
                  )}
                  {/* Hover overlay */}
                  <div className="marquee-card-overlay">
                    <span className="marquee-card-overlay-text">
                      {poster.title || poster.product?.name || 'View'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom gold rule */}
      <div className="marquee-gold-rule" aria-hidden="true" />

      <style>{`
        /* ── MARQUEE SECTION ─────────────────────────────────── */
        .marquee-section {
          background: linear-gradient(180deg, var(--color-burgundy) 0%, #2D0A12 100%);
          padding: var(--space-6) 0;
          position: relative;
          overflow: hidden;
        }

        .marquee-gold-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
          opacity: 0.4;
        }

        .marquee-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          padding: var(--space-4) 0 var(--space-5);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-sm);
          font-style: italic;
          letter-spacing: 0.25em;
          color: var(--color-gold-light);
          text-transform: uppercase;
          opacity: 0.8;
        }

        /* ── OUTER MASK ──────────────────────────────────────── */
        .marquee-outer {
          overflow: hidden;
          /* Fade edges */
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            90deg,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        /* ── SCROLLING TRACK ─────────────────────────────────── */
        .marquee-track {
          display: flex;
          gap: var(--space-4);
          width: max-content;
          animation: marquee-scroll linear infinite;
          /* Duration = number of items × 3s each */
          animation-duration: calc(var(--marquee-count, 6) * 3s);
          padding: var(--space-4) var(--space-4) var(--space-6);
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── POSTER CARD ─────────────────────────────────────── */
        .marquee-card {
          flex-shrink: 0;
          width: 200px;
          height: 266px;   /* 3:4 portrait ratio */
          border-radius: var(--radius-xl);
          overflow: hidden;
          position: relative;
          display: block;
          text-decoration: none;
          border: 1px solid rgba(201,148,42,0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .marquee-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--color-gold);
          border-color: var(--color-gold);
        }

        .marquee-card-img-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .marquee-card-img {
          transition: transform 0.5s ease;
        }

        .marquee-card:hover .marquee-card-img {
          transform: scale(1.08);
        }

        .marquee-card-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(45,10,18,0.8);
          font-size: 3rem;
        }

        /* ── HOVER OVERLAY ───────────────────────────────────── */
        .marquee-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(26,8,14,0.85) 0%,
            rgba(26,8,14,0.2) 50%,
            transparent 100%
          );
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: var(--space-4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .marquee-card:hover .marquee-card-overlay {
          opacity: 1;
        }

        .marquee-card-overlay-text {
          color: var(--color-cream);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-sm);
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.05em;
          padding: 0 var(--space-2);
        }

        /* ── RESPONSIVE ──────────────────────────────────────── */
        @media (max-width: 1024px) {
          .marquee-card {
            width: 160px;
            height: 213px;
          }
        }

        @media (max-width: 768px) {
          .marquee-card {
            width: 130px;
            height: 173px;
          }
          .marquee-label {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
}
