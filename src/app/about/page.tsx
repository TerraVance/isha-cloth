import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Isha Vastram — Our Story & Mission',
  description: 'Discover the story behind Isha Vastram — how a love for handloom sarees became a mission to connect master weavers with saree lovers across India.',
};

const VALUES = [
  { icon: '🌿', title: 'Authenticity First', desc: 'Every saree is sourced directly from weaver cooperatives — no middlemen, no machine shortcuts. What you see is what you receive.' },
  { icon: '💚', title: 'Eco-Conscious', desc: 'Pure cotton, natural fibres, and traditional vegetable dyes. Our sarees are gentle on your skin and kind to the earth.' },
  { icon: '🤝', title: 'Fair to Artisans', desc: 'We pay well above market rates directly to our weaver families — ensuring their ancient craft remains a viable livelihood.' },
  { icon: '❤️', title: 'Packed with Love', desc: 'Each saree is hand-folded, quality-checked, and packed with care. We treat every order as if it\'s going to our own family.' },
];

const MILESTONES = [
  { year: '2019', event: 'Founded in a small apartment in Pune with a vision to make authentic handloom accessible to all.' },
  { year: '2020', event: 'Partnered with our first 5 weaver families in Yeola and Chanderi.' },
  { year: '2022', event: 'Crossed 500+ happy customers. Expanded to weavers in Varanasi and Murshidabad.' },
  { year: '2024', event: 'Working with 20+ artisan families. Over 2,000 sarees delivered across India.' },
];

const WEAVE_TYPES = [
  { name: 'Paithani', region: 'Yeola, Maharashtra', desc: 'Known for vibrant peacock motifs and zari borders — a royal Maharashtrian heirloom.' },
  { name: 'Chanderi', region: 'Chanderi, MP', desc: 'Feather-light cotton-silk blend with delicate sheer texture. Perfect for summers.' },
  { name: 'Banarasi Cotton', region: 'Varanasi, UP', desc: 'Rich brocade weaving with intricate gold thread work on breathable cotton base.' },
  { name: 'Tant', region: 'Murshidabad, WB', desc: 'Fine handloom cotton from Bengal — crisp, cool, and effortlessly elegant.' },
];

const PROMISES = [
  { icon: '🔍', title: 'Verified Handloom', desc: 'Every product is personally verified before listing.' },
  { icon: '📦', title: 'Secure Packaging', desc: 'Sarees are tissue-wrapped and box-packed to prevent damage.' },
  { icon: '🚚', title: 'Pan-India Delivery', desc: 'We deliver to every corner of India within 5–7 business days.' },
  { icon: '🔄', title: 'Easy Exchange', desc: '7-day easy exchange if the saree doesn\'t meet your expectations.' },
  { icon: '💬', title: 'WhatsApp Support', desc: 'Direct chat with us on WhatsApp — no bots, no waiting queues.' },
  { icon: '🏷️', title: 'No Hidden Charges', desc: 'The price you see is the price you pay. No surprise fees at checkout.' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <div className="about-hero">
          <div className="container about-hero-inner">
            <div className="about-hero-text">
              <p className="section-tagline" style={{ color: 'var(--color-gold-light)' }}>Our Story</p>
              <h1 className="about-hero-title">
                Rooted in Tradition,<br />Woven with Love
              </h1>
              <p className="about-hero-desc">
                Isha Vastram was born from a simple belief — every woman deserves to wear the art of India.
                We connect you directly to the skilled hands that weave these timeless masterpieces,
                preserving centuries-old craft while bringing it into your modern wardrobe.
              </p>
              <div className="about-hero-stats">
                {[
                  { num: '20+', label: 'Artisan Families' },
                  { num: '2,000+', label: 'Sarees Delivered' },
                  { num: '4', label: 'Weaving Traditions' },
                  { num: '7-day', label: 'Easy Exchange' },
                ].map(s => (
                  <div key={s.label} className="about-stat">
                    <div className="about-stat-num">{s.num}</div>
                    <div className="about-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-hero-deco" aria-hidden="true">
              <div className="about-deco-ring about-deco-ring-1" />
              <div className="about-deco-ring about-deco-ring-2" />
              <div className="about-deco-emoji">🌸</div>
            </div>
          </div>
        </div>

        {/* ── OUR STORY ── */}
        <section className="section about-story-section" aria-labelledby="story-title">
          <div className="container">
            <div className="about-story-grid">
              <div className="about-story-text">
                <p className="section-tagline">How It All Began</p>
                <h2 className="section-title" id="story-title" style={{ textAlign: 'left' }}>
                  A Grandmother's Saree Changed Everything
                </h2>
                <div className="section-divider" style={{ margin: 'var(--space-5) 0' }} />
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.85, marginBottom: 'var(--space-5)' }}>
                  Growing up in Pune, our founder Isha watched her grandmother drape a crisp handloom cotton saree every single morning —
                  like a ritual that connected her to something ancient and beautiful. That image never left her.
                </p>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.85, marginBottom: 'var(--space-5)' }}>
                  Years later, while visiting a weaving village in Yeola, Isha met master weavers who had been practicing
                  Paithani weaving for three generations — yet struggled to earn a fair income because most of their revenue
                  went to middlemen and retailers.
                </p>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.85 }}>
                  That day, Isha Vastram was born. A direct bridge between the artisan's loom and your wardrobe.
                  No middlemen. No compromises. Just authentic, beautiful handloom at a fair price for everyone.
                </p>
              </div>
              <div className="about-story-quote">
                <div className="quote-card">
                  <div className="quote-mark">"</div>
                  <p className="quote-text">
                    The loom is not just a machine. It carries the prayers of the weaver,
                    the patience of tradition, and the joy of the woman who wears it.
                  </p>
                  <div className="quote-author">
                    <div className="quote-author-name">Isha, Founder</div>
                    <div className="quote-author-role">Isha Vastram</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MILESTONE TIMELINE ── */}
        <section className="section" style={{ background: 'var(--color-cream)' }} aria-labelledby="journey-title">
          <div className="container" style={{ maxWidth: 800 }}>
            <p className="section-tagline" style={{ textAlign: 'center' }}>Our Journey</p>
            <h2 className="section-title" id="journey-title" style={{ textAlign: 'center' }}>How We Grew</h2>
            <div className="section-divider" />
            <div className="timeline">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`timeline-item${i % 2 === 0 ? '' : ' timeline-right'}`}>
                  <div className="timeline-year">{m.year}</div>
                  <div className="timeline-dot" />
                  <div className="timeline-content">{m.event}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WEAVE TRADITIONS ── */}
        <section className="section" aria-labelledby="weaves-title">
          <div className="container">
            <p className="section-tagline" style={{ textAlign: 'center' }}>What We Curate</p>
            <h2 className="section-title" id="weaves-title" style={{ textAlign: 'center' }}>Weaving Traditions We Celebrate</h2>
            <div className="section-divider" />
            <div className="weaves-grid">
              {WEAVE_TYPES.map((w, i) => (
                <div key={w.name} className="weave-card reveal animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="weave-top">
                    <h3 className="weave-name">{w.name}</h3>
                    <span className="weave-region">📍 {w.region}</span>
                  </div>
                  <p className="weave-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="section" style={{ background: 'var(--color-cream)' }} aria-labelledby="values-title">
          <div className="container">
            <p className="section-tagline" style={{ textAlign: 'center' }}>What We Stand For</p>
            <h2 className="section-title" id="values-title" style={{ textAlign: 'center' }}>Our Core Values</h2>
            <div className="section-divider" />
            <div className="about-values-grid">
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

        {/* ── OUR PROMISE ── */}
        <section className="section" aria-labelledby="promise-title">
          <div className="container">
            <p className="section-tagline" style={{ textAlign: 'center' }}>Our Commitment</p>
            <h2 className="section-title" id="promise-title" style={{ textAlign: 'center' }}>The Isha Vastram Promise</h2>
            <div className="section-divider" />
            <div className="promises-grid">
              {PROMISES.map((p, i) => (
                <div key={p.title} className="promise-card reveal animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="promise-icon">{p.icon}</span>
                  <div>
                    <div className="promise-title">{p.title}</div>
                    <div className="promise-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{ background: 'linear-gradient(135deg, var(--color-maroon), var(--color-burgundy))', padding: 'var(--space-20) 0', textAlign: 'center' }}
          aria-label="Shop now"
        >
          <div className="container">
            <p style={{ color: 'var(--color-gold-light)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
              Ready to Find Yours?
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 'var(--space-5)', lineHeight: 1.2 }}>
              Join 2,000+ Women Who<br />Chose Authentic Handloom
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-10)', maxWidth: 500, margin: '0 auto var(--space-10)' }}>
              Each saree in our collection comes with a story — of the weaver, the region, and the tradition. Find the one that speaks to you.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/collection" className="btn btn-gold btn-lg" id="about-shop-cta">
                Browse Collection →
              </a>
              <a
                href="https://wa.me/919999999999?text=Hi!%20I%20saw%20your%20About%20page%20and%20would%20love%20to%20know%20more%20about%20your%20sarees."
                className="btn btn-whatsapp btn-lg"
                target="_blank"
                rel="noopener noreferrer"
                id="about-wa-cta"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat with Us on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />


      <style>{`
        /* ── HERO ── */
        .about-hero {
          background: linear-gradient(135deg, #1A080E 0%, var(--color-burgundy) 50%, #3D0B18 100%);
          color: white;
          padding: var(--space-20) 0 var(--space-16);
          position: relative;
          overflow: hidden;
        }
        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9942A' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .about-hero-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--space-12);
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .about-hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          color: white;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }
        .about-hero-desc {
          font-size: var(--text-lg);
          color: rgba(255,255,255,0.75);
          max-width: 600px;
          line-height: 1.8;
          margin-bottom: var(--space-10);
        }
        .about-hero-stats {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .about-stat-num {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-gold-light);
          font-weight: 700;
          line-height: 1;
          margin-bottom: var(--space-1);
        }
        .about-stat-label {
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        .about-hero-deco {
          position: relative;
          width: 200px;
          height: 200px;
          flex-shrink: 0;
        }
        .about-deco-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(201,148,42,0.25);
        }
        .about-deco-ring-1 { inset: 0; animation: spin 20s linear infinite; }
        .about-deco-ring-2 { inset: 20px; animation: spin 14s linear infinite reverse; border-style: dashed; }
        .about-deco-emoji {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── STORY ── */
        .about-story-section { background: white; }
        .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          align-items: start;
        }
        .quote-card {
          background: var(--color-cream);
          border-radius: var(--radius-2xl);
          padding: var(--space-10) var(--space-8);
          border: 1px solid var(--color-gold-light);
          position: sticky;
          top: calc(var(--navbar-height) + var(--space-8));
        }
        .quote-mark {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: var(--color-gold);
          line-height: 0.5;
          margin-bottom: var(--space-4);
          display: block;
        }
        .quote-text {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          color: var(--color-burgundy);
          line-height: 1.7;
          font-style: italic;
          margin-bottom: var(--space-6);
        }
        .quote-author-name {
          font-weight: 700;
          color: var(--color-maroon);
          font-size: var(--text-sm);
        }
        .quote-author-role {
          color: var(--color-gray-400);
          font-size: var(--text-xs);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── TIMELINE ── */
        .timeline {
          position: relative;
          margin-top: var(--space-10);
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--color-gold), var(--color-maroon));
          transform: translateX(-50%);
        }
        .timeline-item {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
          position: relative;
        }
        .timeline-year {
          width: calc(50% - var(--space-6));
          text-align: right;
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          color: var(--color-maroon);
          font-weight: 700;
          flex-shrink: 0;
        }
        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-gold);
          border: 3px solid white;
          box-shadow: 0 0 0 3px var(--color-gold);
          flex-shrink: 0;
          z-index: 1;
        }
        .timeline-content {
          width: calc(50% - var(--space-6));
          background: white;
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          color: var(--color-gray-600);
          line-height: 1.7;
          border: 1px solid var(--color-gray-100);
          box-shadow: var(--shadow-sm);
        }
        .timeline-right { flex-direction: row-reverse; }
        .timeline-right .timeline-year { text-align: left; }

        /* ── WEAVES ── */
        .weaves-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
          margin-top: var(--space-8);
        }
        .weave-card {
          background: var(--color-cream);
          border: 1px solid var(--color-cream-dark);
          border-radius: var(--radius-xl);
          padding: var(--space-7);
          transition: all var(--transition-normal);
        }
        .weave-card:hover {
          border-color: var(--color-gold);
          transform: translateY(-3px);
          box-shadow: var(--shadow-gold);
        }
        .weave-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }
        .weave-name {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          color: var(--color-burgundy);
        }
        .weave-region {
          font-size: var(--text-xs);
          color: var(--color-gold-dark);
          font-weight: 500;
          white-space: nowrap;
        }
        .weave-desc {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          line-height: 1.7;
        }

        /* ── VALUES ── */
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-top: var(--space-8);
        }
        .why-card { background: white; border-radius: var(--radius-xl); padding: var(--space-8) var(--space-6); text-align: center; border: 1px solid var(--color-cream-dark); transition: all var(--transition-normal); }
        .why-card:hover { border-color: var(--color-gold); transform: translateY(-4px); box-shadow: var(--shadow-gold); }
        .why-icon { font-size: 2.5rem; margin-bottom: var(--space-4); display: block; transition: transform var(--transition-normal); }
        .why-card:hover .why-icon { transform: scale(1.15) rotate(5deg); }
        .why-title-item { font-family: var(--font-heading); font-size: var(--text-xl); color: var(--color-burgundy); margin-bottom: var(--space-3); }
        .why-desc { font-size: var(--text-sm); color: var(--color-gray-500); line-height: 1.7; }

        /* ── PROMISES ── */
        .promises-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-5);
          margin-top: var(--space-8);
        }
        .promise-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--color-cream);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-cream-dark);
          transition: all var(--transition-fast);
        }
        .promise-card:hover {
          border-color: var(--color-gold-light);
          background: white;
        }
        .promise-icon { font-size: 1.8rem; flex-shrink: 0; line-height: 1; }
        .promise-title { font-weight: 700; color: var(--color-burgundy); margin-bottom: var(--space-1); font-size: var(--text-sm); }
        .promise-desc { font-size: var(--text-xs); color: var(--color-gray-500); line-height: 1.6; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .about-values-grid { grid-template-columns: repeat(2, 1fr); }
          .promises-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .about-hero-inner { grid-template-columns: 1fr; }
          .about-hero-deco { display: none; }
          .about-story-grid { grid-template-columns: 1fr; }
          .quote-card { position: static; }
          .timeline::before { left: 20px; }
          .timeline-item { flex-direction: column; align-items: flex-start; padding-left: 48px; }
          .timeline-right { flex-direction: column; }
          .timeline-year { width: auto; text-align: left; }
          .timeline-dot { position: absolute; left: 13px; top: 4px; }
          .timeline-content { width: 100%; }
          .weaves-grid { grid-template-columns: 1fr; }
          .about-values-grid { grid-template-columns: 1fr 1fr; }
          .promises-grid { grid-template-columns: 1fr; }
          .about-hero-stats { gap: var(--space-5); }
        }
      `}</style>
    </>
  );
}
