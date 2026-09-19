import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Isha Vastram',
  description: 'Learn about Isha Vastram — our story, our artisans, and our mission to bring authentic handloom sarees to every home.',
};

const TEAM = [
  { name: 'Isha', role: 'Founder & Curator', emoji: '👩', desc: 'Passionate about preserving Indian textile traditions and connecting customers to authentic weavers.' },
  { name: 'Artisans', role: 'Master Weavers', emoji: '🧵', desc: 'Skilled craftsmen from across Maharashtra and UP who weave each saree with decades of expertise.' },
];

const VALUES = [
  { icon: '🌿', title: 'Authenticity', desc: 'Every saree is sourced directly from weavers — no middlemen, no compromises on quality.' },
  { icon: '💚', title: 'Sustainability', desc: 'Pure cotton and natural dyes. Our sarees are eco-friendly and kind to the planet.' },
  { icon: '🤝', title: 'Fair Trade', desc: 'We pay our artisans fairly and ensure their craft is valued and preserved.' },
  { icon: '❤️', title: 'Love & Care', desc: 'Every package is packed with love. We treat each order as if it were for a family member.' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <div className="about-hero">
          <div className="container">
            <p className="section-tagline">Our Story</p>
            <h1 className="about-hero-title">Rooted in Tradition,<br />Woven with Love</h1>
            <p className="about-hero-desc">
              Isha Vastram was born from a simple belief — every woman deserves to wear the art of India.
              We connect you directly to the hands that weave these masterpieces.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <section className="section" aria-labelledby="story-title">
          <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
            <h2 className="section-title" id="story-title">Why Isha Vastram?</h2>
            <div className="section-divider" />
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
              Growing up watching her grandmother drape a fresh cotton saree every morning, our founder Isha developed a deep love for handloom textiles.
              When she saw how master weavers struggled to reach customers in the digital age, she created Isha Vastram — a bridge between artisans and saree lovers.
            </p>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
              Today, we work with 20+ weaver families across Maharashtra, Uttar Pradesh, and West Bengal. Every saree tells a story — of skill, patience, and generations of knowledge passed down through families.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ background: 'var(--color-cream)' }} aria-labelledby="values-title">
          <div className="container">
            <p className="section-tagline">What We Stand For</p>
            <h2 className="section-title" id="values-title">Our Values</h2>
            <div className="section-divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-6)' }}>
              {VALUES.map((v, i) => (
                <div key={v.title} className="why-card reveal animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="why-icon">{v.icon}</div>
                  <h3 className="why-title-item">{v.title}</h3>
                  <p className="why-desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section" aria-labelledby="team-title">
          <div className="container">
            <p className="section-tagline">The People</p>
            <h2 className="section-title" id="team-title">Behind Every Saree</h2>
            <div className="section-divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-8)', maxWidth: 700, margin: '0 auto' }}>
              {TEAM.map(t => (
                <div key={t.name} className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>{t.emoji}</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-1)' }}>{t.name}</h3>
                  <p style={{ color: 'var(--color-gold-dark)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>{t.role}</p>
                  <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="loop-cta-section" aria-label="Shop now CTA" style={{ background: 'linear-gradient(135deg, var(--color-maroon), var(--color-burgundy))', padding: 'var(--space-16) 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--color-gold-light)', marginBottom: 'var(--space-4)' }}>
              Join the Isha Vastram Family 🌸
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)' }}>
              Thousands of happy customers. Authentic sarees. Direct from weavers to you.
            </p>
            <a href="/collection" className="btn btn-gold btn-lg" id="about-shop-now">
              Shop Our Collection →
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />

      <style>{`
        .about-hero {
          background: linear-gradient(135deg, var(--color-burgundy), #3D0B18);
          color: white;
          padding: var(--space-20) 0;
          text-align: center;
        }
        .about-hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          color: white;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }
        .about-hero-desc {
          font-size: var(--text-xl);
          color: rgba(255,255,255,0.75);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .why-card { background: white; border-radius: var(--radius-xl); padding: var(--space-8) var(--space-6); text-align: center; border: 1px solid var(--color-cream-dark); transition: all var(--transition-normal); }
        .why-card:hover { border-color: var(--color-gold); transform: translateY(-4px); box-shadow: var(--shadow-gold); }
        .why-icon { font-size: 2.5rem; margin-bottom: var(--space-4); display: block; transition: transform var(--transition-normal); }
        .why-card:hover .why-icon { transform: scale(1.15) rotate(5deg); }
        .why-title-item { font-family: var(--font-heading); font-size: var(--text-xl); color: var(--color-burgundy); margin-bottom: var(--space-3); }
        .why-desc { font-size: var(--text-sm); color: var(--color-gray-500); line-height: 1.7; }
        @media (max-width: 768px) {
          div[style*="repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
          div[style*="repeat(2,1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
