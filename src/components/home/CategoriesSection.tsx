import React from 'react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

// Category styling — only shown when products exist for that category
const CATEGORY_STYLES: Record<string, { emoji: string; subtitle: string; color: string }> = {
  Cotton:    { emoji: '🌿', subtitle: 'Everyday Elegance',     color: 'linear-gradient(135deg, #2D6A4F, #40916C)' },
  Silk:      { emoji: '✨', subtitle: 'Pure Luxury',           color: 'linear-gradient(135deg, var(--color-maroon), var(--color-maroon-dark))' },
  Banarasi:  { emoji: '👰', subtitle: 'Bridal & Festive',     color: 'linear-gradient(135deg, #C77DFF, #7B2FBE)' },
  Paithani:  { emoji: '🌸', subtitle: 'Maharashtrian Pride',  color: 'linear-gradient(135deg, var(--color-gold-dark), #8B6914)' },
  Chanderi:  { emoji: '🦚', subtitle: 'Sheer Sophistication', color: 'linear-gradient(135deg, #0D9488, #0F766E)' },
  Kanjivaram: { emoji: '🌺', subtitle: 'South Indian Royal',  color: 'linear-gradient(135deg, #C2410C, #9A3412)' },
  Linen:     { emoji: '🍃', subtitle: 'Cool & Breathable',    color: 'linear-gradient(135deg, #65A30D, #4D7C0F)' },
  Georgette: { emoji: '💜', subtitle: 'Light & Flowy',        color: 'linear-gradient(135deg, #A855F7, #7E22CE)' },
};

// Default fallback style for unknown categories
const DEFAULT_STYLE = { emoji: '🌸', subtitle: 'Explore', color: 'linear-gradient(135deg, var(--color-maroon), var(--color-burgundy))' };

async function getActiveCategories() {
  // Pull distinct categories from active products only
  const { data } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('status', 'active');
  
  if (!data || data.length === 0) return [];

  // Count products per category
  const counts: Record<string, number> = {};
  data.forEach((row: { category: string }) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
  });

  // Return unique categories with their counts
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a) // most products first
    .slice(0, 4) // show top 4
    .map(([name, count]) => ({
      name,
      count,
      ...(CATEGORY_STYLES[name] || DEFAULT_STYLE),
    }));
}

export default async function CategoriesSection() {
  const categories = await getActiveCategories();

  // Nothing to show until admin adds products
  if (categories.length === 0) return null;

  return (
    <section className="section categories-section" aria-labelledby="categories-title">
      <div className="container">
        <p className="section-tagline">Browse By Type</p>
        <h2 className="section-title" id="categories-title">Shop By Category</h2>
        <div className="section-divider" />

        <div className="categories-grid" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={`/collection?category=${cat.name}`}
              className="category-card reveal animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
              aria-label={`Shop ${cat.name} — ${cat.subtitle}`}
              id={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Background gradient */}
              <div className="cat-bg" style={{ background: cat.color }} aria-hidden="true" />

              {/* Emoji */}
              <span className="cat-emoji" aria-hidden="true">{cat.emoji}</span>

              {/* Text overlay */}
              <div className="cat-text">
                <h3 className="cat-name">{cat.name}</h3>
                <p className="cat-subtitle">{cat.subtitle}</p>
                <p className="cat-count">{cat.count} {cat.count === 1 ? 'Saree' : 'Sarees'}</p>
              </div>

              {/* Hover CTA */}
              <div className="cat-hover-cta">
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .categories-section {
          background: var(--color-cream);
        }

        .categories-grid {
          display: grid;
          gap: var(--space-5);
        }

        @media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px)  { .categories-grid { grid-template-columns: 1fr !important; } }

        .category-card {
          position: relative;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          aspect-ratio: 3/4;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }

        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: var(--shadow-xl);
        }

        .cat-bg {
          position: absolute;
          inset: 0;
          transition: opacity var(--transition-normal);
        }

        .cat-emoji {
          position: relative;
          z-index: 1;
          font-size: 3.5rem;
          margin-bottom: var(--space-4);
          transition: transform var(--transition-normal);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        .category-card:hover .cat-emoji {
          transform: scale(1.2) translateY(-4px);
        }

        .cat-text {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
          transition: transform var(--transition-normal);
        }

        .category-card:hover .cat-text {
          transform: translateY(-8px);
        }

        .cat-name {
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          margin-bottom: var(--space-1);
        }

        .cat-subtitle {
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.05em;
        }

        .cat-count {
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.6);
          margin-top: var(--space-1);
        }

        .cat-hover-cta {
          position: absolute;
          bottom: var(--space-6);
          z-index: 2;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          color: white;
          font-size: var(--text-sm);
          font-weight: 600;
          padding: var(--space-2) var(--space-5);
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.3);
          opacity: 0;
          transform: translateY(12px);
          transition: all var(--transition-normal);
        }

        .category-card:hover .cat-hover-cta {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
