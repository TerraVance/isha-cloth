import React from 'react';
import { Testimonial } from '@/types/database';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? '#D4A537' : '#D4D4D4', fontSize: '1rem' }} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  // No testimonials yet — hide section entirely (admin adds via panel)
  if (!testimonials || testimonials.length === 0) return null;

  const items = testimonials;

  return (
    <section className="section testimonials-section" aria-labelledby="testimonials-title">
      <div className="container">
        <p className="section-tagline">🔄 Social Proof Loop — Real Customer Reviews</p>
        <h2 className="section-title" id="testimonials-title">Happy Customers</h2>
        <div className="section-divider" />

        <div className="testimonials-track-wrap" aria-label="Customer testimonials carousel">
          <div className="testimonials-track">
            {/* Duplicate for seamless loop */}
            {[...items, ...items].map((t, i) => (
              <div key={`${t.id}-${i}`} className="testimonial-card" role="article">
                {/* Photo or Avatar */}
                <div className="testimonial-avatar" aria-hidden="true">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={`${t.customer_name} wearing saree`} />
                  ) : (
                    <span>{t.customer_name.charAt(0)}</span>
                  )}
                </div>

                <StarRating rating={t.rating || 5} />

                <p className="testimonial-text">&ldquo;{t.review_text}&rdquo;</p>

                <div className="testimonial-author">
                  <strong>{t.customer_name}</strong>
                  {t.product && <span>on {t.product.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-section {
          background: linear-gradient(135deg, var(--color-burgundy), #3D0B18);
          color: white;
          overflow: hidden;
        }

        .testimonials-section .section-title { color: var(--color-gold-light); }
        .testimonials-section .section-tagline { color: var(--color-gold); }
        .testimonials-section .section-divider { opacity: 0.4; }
        .testimonials-section .section-subtitle { color: rgba(255,255,255,0.7); }

        .testimonials-track-wrap {
          overflow: hidden;
          cursor: default;
        }

        .testimonials-track {
          display: flex;
          gap: var(--space-6);
          width: max-content;
          animation: scroll-track 30s linear infinite;
        }

        .testimonials-track:hover { animation-play-state: paused; }

        @keyframes scroll-track {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .testimonial-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212,165,55,0.2);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          width: 320px;
          flex-shrink: 0;
          transition: background var(--transition-normal), border-color var(--transition-normal);
        }

        .testimonial-card:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(212,165,55,0.5);
        }

        .testimonial-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-gold), var(--color-maroon));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          font-weight: 700;
          color: white;
          margin-bottom: var(--space-4);
          overflow: hidden;
          border: 2px solid var(--color-gold);
        }

        .testimonial-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .stars { margin-bottom: var(--space-3); }

        .testimonial-text {
          font-size: var(--text-base);
          line-height: 1.7;
          color: rgba(255,255,255,0.85);
          margin-bottom: var(--space-5);
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .testimonial-author strong {
          font-weight: 600;
          color: var(--color-gold-light);
          font-size: var(--text-sm);
        }

        .testimonial-author span {
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.5);
        }
      `}</style>
    </section>
  );
}
