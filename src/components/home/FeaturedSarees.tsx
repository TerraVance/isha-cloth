import React from 'react';
import Link from 'next/link';
import SareeCard from '@/components/product/SareeCard';
import { Product } from '@/types/database';

interface FeaturedSareesProps {
  products: Product[];
}

export default function FeaturedSarees({ products }: FeaturedSareesProps) {
  return (
    <section className="section featured-section" aria-labelledby="featured-title">
      <div className="container">
        <p className="section-tagline">✦ Handpicked For You ✦</p>
        <h2 className="section-title" id="featured-title">Featured Collection</h2>
        <div className="section-divider-inner">
          <span style={{ color: 'var(--color-gold)', fontSize: '1.25rem' }}>❧</span>
        </div>

        {products.length === 0 ? (
          <div className="featured-empty animate-fade-in-up">
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }} aria-hidden="true">🌸</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-2)' }}>
              Collection Coming Soon
            </h3>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-gray-500)', maxWidth: 400, margin: '0 auto var(--space-6)', lineHeight: 1.7 }}>
              Our exquisite saree collection is being curated. Check back soon or browse what&apos;s available!
            </p>
          </div>
        ) : (
          /* C3: Scroll-snap carousel on mobile, grid on desktop */
          <div className="featured-carousel" role="list" aria-label="Featured sarees">
            {products.map((product, i) => (
              <div key={product.id} className="featured-carousel-item reveal animate-fade-in-up" role="listitem" style={{ animationDelay: `${i * 0.1}s` }}>
                <SareeCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="featured-cta-wrap">
          <Link href="/collection" className="btn btn-outline btn-lg" id="featured-view-all">
            View All Sarees
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .featured-section {
          background: var(--color-cream-paper);
          background-image: var(--texture-damask);
        }
        .section-tagline {
          text-align: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: var(--text-base);
          font-style: italic;
          letter-spacing: 0.12em;
          color: var(--color-gold-dark);
          margin-bottom: var(--space-2);
        }

        /* Desktop: 4-column grid */
        .featured-carousel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
        }

        .featured-carousel-item { min-width: 0; }

        /* Tablet: 3-column grid */
        @media (max-width: 1024px) {
          .featured-carousel { grid-template-columns: repeat(3, 1fr); }
        }

        /* C3: Mobile — horizontal scroll-snap carousel */
        @media (max-width: 768px) {
          .featured-carousel {
            display: flex;
            overflow-x: auto;
            gap: var(--space-4);
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: var(--space-4);
            /* hide scrollbar visually */
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .featured-carousel::-webkit-scrollbar { display: none; }
          .featured-carousel-item {
            flex: 0 0 72vw;
            scroll-snap-align: start;
          }
        }

        @media (max-width: 400px) {
          .featured-carousel-item { flex: 0 0 84vw; }
        }

        .featured-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: var(--space-10);
        }

        .featured-empty {
          text-align: center;
          padding: var(--space-12) var(--space-6);
          background: var(--color-cream);
          border-radius: var(--radius-2xl);
          border: 2px dashed var(--color-gold-light);
        }
      `}</style>
    </section>
  );
}
