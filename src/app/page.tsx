import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedSarees from '@/components/home/FeaturedSarees';
import CategoriesSection from '@/components/home/CategoriesSection';
import Testimonials from '@/components/home/Testimonials';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';

export const metadata: Metadata = {
  title: 'Isha Vastram — Pure Cotton Handloom Sarees',
  description: 'Discover exquisite pure cotton handloom sarees. Authentic Banarasi, Paithani, Chanderi and more — crafted with love, delivered to your door.',
};

// Revalidate every 5 minutes for fresh featured products
export const revalidate = 300;

async function getFeaturedProducts() {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return data || [];
}

async function getApprovedTestimonials() {
  const { data } = await supabaseAdmin
    .from('testimonials')
    .select('*, product:products(id, name, images)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return data || [];
}

async function getStats() {
  const [products, customers] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }),
  ]);
  return {
    totalProducts: products.count || 0,
    totalCustomers: customers.count || 0,
  };
}

export default async function HomePage() {
  const [featuredProducts, testimonials, stats] = await Promise.all([
    getFeaturedProducts(),
    getApprovedTestimonials(),
    getStats(),
  ]);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection stats={stats} />
        <FeaturedSarees products={featuredProducts} />
        <CategoriesSection />

        {/* Why Choose Us */}
        <section className="section why-section" aria-labelledby="why-title">
          <div className="container">
            <p className="section-tagline">Why Isha Vastram</p>
            <h2 className="section-title" id="why-title">The Isha Vastram Promise</h2>
            <div className="section-divider" />
            <div className="why-grid">
              {[
                { icon: '🌿', title: 'Pure Cotton', desc: 'Every saree is crafted from 100% pure cotton — breathable, soft, and long-lasting.' },
                { icon: '🤝', title: 'Handloom Craft', desc: 'Woven by skilled artisans preserving centuries-old weaving traditions of India.' },
                { icon: '💰', title: 'Fair Prices', desc: 'Premium quality without the premium price tag. Directly from weavers to you.' },
                { icon: '🚀', title: 'Fast Delivery', desc: 'Quick dispatch and reliable delivery across India. WhatsApp updates at every step.' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="why-card reveal animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="why-icon" aria-hidden="true">{item.icon}</div>
                  <h3 className="why-title-item">{item.title}</h3>
                  <p className="why-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Testimonials testimonials={testimonials} />

        {/* Loop CTA — Post Purchase Loop Banner */}
        <section className="loop-cta-section" aria-label="Special offer">
          <div className="container">
            <div className="loop-cta-inner">
              <div>
                <h2 className="loop-cta-title">Share & Save Together 🎁</h2>
                <p className="loop-cta-desc">
                  Order any saree and get code <strong>ISHA10</strong> — 10% off for you and your friends!
                </p>
              </div>
              <a href="/collection" className="btn btn-gold btn-lg loop-cta-btn">
                Shop & Get Coupon →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />

      <style>{`
        .why-section { background: var(--color-white); }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
        }
        @media (max-width: 1024px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .why-grid { grid-template-columns: 1fr; } }

        .why-card {
          background: var(--color-cream);
          border-radius: var(--radius-xl);
          padding: var(--space-8) var(--space-6);
          text-align: center;
          border: 1px solid var(--color-cream-dark);
          transition: all var(--transition-normal);
        }
        .why-card:hover {
          border-color: var(--color-gold);
          transform: translateY(-4px);
          box-shadow: var(--shadow-gold);
        }

        .why-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-4);
          display: block;
          transition: transform var(--transition-normal);
        }
        .why-card:hover .why-icon { transform: scale(1.15) rotate(5deg); }

        .why-title-item {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          color: var(--color-burgundy);
          margin-bottom: var(--space-3);
        }

        .why-desc {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          line-height: 1.7;
        }

        /* 🔄 Post-Purchase Loop CTA Banner */
        .loop-cta-section {
          background: linear-gradient(135deg, var(--color-maroon), var(--color-burgundy));
          padding: var(--space-12) 0;
        }

        .loop-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-8);
          flex-wrap: wrap;
        }

        .loop-cta-title {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-gold-light);
          margin-bottom: var(--space-2);
        }

        .loop-cta-desc {
          color: rgba(255,255,255,0.85);
          font-size: var(--text-lg);
        }

        .loop-cta-desc strong { color: var(--color-gold-light); }

        .loop-cta-btn { flex-shrink: 0; min-width: 200px; }

        @media (max-width: 768px) {
          .loop-cta-inner { flex-direction: column; text-align: center; }
          .loop-cta-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
