'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';

const ADMIN_PHONE = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919876543210';

const FAQ = [
  { q: 'Do you ship across India?', a: 'Yes! We ship to all states in India. Shipping is FREE on orders above ₹999.' },
  { q: 'How long does delivery take?', a: 'Orders are dispatched within 1-2 business days. Delivery takes 3-7 days depending on your location.' },
  { q: 'Can I return or exchange a saree?', a: 'Yes, we offer easy returns within 7 days of delivery if the saree is unused and in its original packaging.' },
  { q: 'Are all sarees pure cotton?', a: 'Most of our collection is pure cotton. Sarees made from silk or blended fabric are clearly labeled in the product description.' },
  { q: 'How do I care for my saree?', a: 'Hand wash or dry clean recommended. Use mild detergent, avoid bleach, and dry in shade to preserve colour.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi! I'm ${form.name}.\n\nMessage: ${form.message}\n\nPhone: ${form.phone}`;
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
    setForm({ name: '', phone: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div className="contact-hero">
          <div className="container">
            <h1 className="contact-hero-title">Contact Us 🌸</h1>
            <p className="contact-hero-desc">
              We&apos;re always happy to help! Reach out on WhatsApp for the fastest response.
            </p>
          </div>
        </div>

        <div className="container contact-container">
          <div className="contact-grid">
            {/* Left: Contact form + info */}
            <div>
              {/* Contact Info Cards */}
              <div className="contact-info-cards">
                {[
                  { icon: '📱', title: 'WhatsApp', detail: '+91 98765 43210', href: `https://wa.me/${ADMIN_PHONE}`, cta: 'Chat Now' },
                  { icon: '📧', title: 'Email', detail: 'hello@ishavastram.com', href: 'mailto:hello@ishavastram.com', cta: 'Send Email' },
                  { icon: '📍', title: 'Location', detail: 'Pune, Maharashtra, India', href: '#', cta: null },
                ].map(card => (
                  <div key={card.title} className="contact-info-card">
                    <span className="contact-info-icon" aria-hidden="true">{card.icon}</span>
                    <div>
                      <h3 className="contact-info-title">{card.title}</h3>
                      <p className="contact-info-detail">{card.detail}</p>
                      {card.cta && (
                        <a href={card.href} target="_blank" rel="noopener noreferrer" className="contact-info-cta">
                          {card.cta} →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="card" style={{ padding: 'var(--space-7)', marginTop: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-5)' }}>
                  Send us a Message
                </h2>

                {sent ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-2)' }}>Message Opened in WhatsApp!</h3>
                    <p style={{ color: 'var(--color-gray-500)' }}>Just hit send in WhatsApp and we&apos;ll reply within the hour.</p>
                    <button className="btn btn-outline btn-md" style={{ marginTop: 'var(--space-5)' }} onClick={() => setSent(false)}>Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-name">Your Name</label>
                      <input id="contact-name" className="input" placeholder="Full name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-phone">WhatsApp Number</label>
                      <input id="contact-phone" type="tel" className="input" placeholder="10-digit mobile number" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={10} />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-message">Message</label>
                      <textarea id="contact-message" className="input" rows={4} placeholder="Tell us what you need — we&apos;re happy to help!" required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-whatsapp btn-lg" id="contact-send-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Open in WhatsApp →
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: FAQ */}
            <div>
              <div className="card" style={{ padding: 'var(--space-7)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-6)' }}>
                  Frequently Asked Questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {FAQ.map((f, i) => <FAQItem key={i} question={f.q} answer={f.a} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />

      <style>{`
        .contact-hero {
          background: linear-gradient(135deg, var(--color-burgundy), #3D0B18);
          padding: var(--space-16) 0;
          text-align: center;
          color: white;
          margin-bottom: var(--space-12);
        }
        .contact-hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: white;
          margin-bottom: var(--space-4);
        }
        .contact-hero-desc {
          font-size: var(--text-xl);
          color: rgba(255,255,255,0.75);
          max-width: 500px;
          margin: 0 auto;
        }
        .contact-container { padding-bottom: var(--space-16); }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-10);
          align-items: start;
        }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }

        .contact-info-cards { display: flex; flex-direction: column; gap: var(--space-4); }
        .contact-info-card {
          display: flex; gap: var(--space-4); align-items: flex-start;
          background: white;
          border-radius: var(--radius-xl); padding: var(--space-5);
          box-shadow: var(--shadow-sm); border: 1px solid var(--color-gray-100);
        }
        .contact-info-icon { font-size: 1.75rem; flex-shrink: 0; }
        .contact-info-title { font-weight: 600; color: var(--color-charcoal); margin-bottom: 2px; }
        .contact-info-detail { font-size: var(--text-sm); color: var(--color-gray-500); }
        .contact-info-cta { font-size: var(--text-sm); color: var(--color-maroon); font-weight: 600; text-decoration: none; }
        .contact-info-cta:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', padding: 'var(--space-4) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', background: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--color-charcoal)', fontSize: 'var(--text-base)' }}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span style={{ fontSize: '1.25rem', flexShrink: 0, color: 'var(--color-maroon)', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', lineHeight: 1.7, paddingBottom: 'var(--space-4)', animation: 'fadeIn 0.2s ease' }}>
          {answer}
        </p>
      )}
    </div>
  );
}
