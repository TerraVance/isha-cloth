'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Inline Icons for modern look
const IconImage = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const IconTruck = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconCreditCard = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  
  // States for Hero Image
  const [savingHero, setSavingHero] = useState(false);
  const [heroImage, setHeroImage] = useState<string>('/images/hero-model.jpg');
  const [file, setFile] = useState<File | null>(null);
  const [heroMessage, setHeroMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // States for Shipping
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState('99');
  const [shippingThreshold, setShippingThreshold] = useState('999');
  const [shippingMessage, setShippingMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // States for Payment
  const [savingPayment, setSavingPayment] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [paymentMessage, setPaymentMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // States for WhatsApp
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [waPhone, setWaPhone] = useState('919209337387');
  const [waDefaultMsg, setWaDefaultMsg] = useState('Hi! I would like to know about your sarees 🌸');
  const [waMessage, setWaMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [heroRes, shippingRes, paymentRes, waRes] = await Promise.all([
          fetch('/api/settings?key=hero_image'),
          fetch('/api/settings?key=shipping'),
          fetch('/api/settings?key=payment'),
          fetch('/api/settings?key=whatsapp')
        ]);
        
        const heroJson = await heroRes.json();
        if (heroJson.data && heroJson.data.url) setHeroImage(heroJson.data.url);

        const shippingJson = await shippingRes.json();
        if (shippingJson.data) {
          setShippingCost(shippingJson.data.cost?.toString() || '99');
          setShippingThreshold(shippingJson.data.threshold?.toString() || '999');
        }

        const paymentJson = await paymentRes.json();
        if (paymentJson.data && typeof paymentJson.data.codEnabled === 'boolean') {
          setCodEnabled(paymentJson.data.codEnabled);
        }

        const waJson = await waRes.json();
        if (waJson.data) {
          if (waJson.data.admin_phone) setWaPhone(waJson.data.admin_phone);
          if (waJson.data.default_message) setWaDefaultMsg(waJson.data.default_message);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    setHeroMessage(null);

    try {
      let finalUrl = heroImage;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || 'Upload failed');
        finalUrl = uploadJson.url;
        setHeroImage(finalUrl);
        setFile(null);
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hero_image', value: { url: finalUrl } }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setHeroMessage({ text: 'Hero image updated successfully!', type: 'success' });
    } catch (err: any) {
      setHeroMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShipping(true);
    setShippingMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'shipping', 
          value: { cost: Number(shippingCost), threshold: Number(shippingThreshold) } 
        }),
      });
      if (!res.ok) throw new Error('Failed to save shipping settings');
      setShippingMessage({ text: 'Shipping config saved!', type: 'success' });
    } catch (err: any) {
      setShippingMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingShipping(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'payment', value: { codEnabled } }),
      });
      if (!res.ok) throw new Error('Failed to save payment settings');
      setPaymentMessage({ text: 'Payment methods updated!', type: 'success' });
    } catch (err: any) {
      setPaymentMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ 
          width: 40, height: 40, border: '4px solid rgba(138,43,72,0.1)', 
          borderTopColor: 'var(--color-burgundy)', borderRadius: '50%', animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ paddingBottom: '4rem' }}>
      <div className="admin-header" style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 className="admin-title" style={{ fontSize: '2rem' }}>Store Configurations</h1>
          <p className="admin-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Manage your global store settings and operational policies.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* === HERO IMAGE SETTINGS === */}
        <div className="admin-card" style={{ padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: '#FDF8F6', color: 'var(--color-burgundy)', borderRadius: '12px' }}>
              <IconImage />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Homepage Hero Image</h2>
          </div>
          
          <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-gray-200)', backgroundColor: '#f9f9f9' }}>
              <Image 
                src={file ? URL.createObjectURL(file) : heroImage} 
                alt="Hero Preview" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="input"
                style={{ padding: '0.5rem', width: '100%' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
                Recommended size: 800x1200px (Portrait). Updates globally.
              </p>
            </div>

            {heroMessage && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', 
                backgroundColor: heroMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: heroMessage.type === 'success' ? '#065F46' : '#991B1B'
              }}>
                {heroMessage.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={savingHero || (!file && !heroImage)} style={{ width: '100%', justifyContent: 'center' }}>
              {savingHero ? 'Uploading...' : 'Update Hero Image'}
            </button>
          </form>
        </div>

        {/* === SHIPPING & PAYMENT COLUMN === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SHIPPING CONFIG */}
          <div className="admin-card" style={{ padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: '#FDF8F6', color: 'var(--color-burgundy)', borderRadius: '12px' }}>
                <IconTruck />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Shipping Configuration</h2>
            </div>

            <form onSubmit={handleSaveShipping} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Base Cost (₹)</label>
                  <input
                    type="number"
                    min="0" step="1" required
                    className="input"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Free Threshold (₹)</label>
                  <input
                    type="number"
                    min="0" step="1" required
                    className="input"
                    value={shippingThreshold}
                    onChange={(e) => setShippingThreshold(e.target.value)}
                  />
                </div>
              </div>

              {shippingMessage && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', 
                  backgroundColor: shippingMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: shippingMessage.type === 'success' ? '#065F46' : '#991B1B'
                }}>
                  {shippingMessage.text}
                </div>
              )}

              <button type="submit" className="btn btn-outline" disabled={savingShipping} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                {savingShipping ? 'Saving...' : 'Save Shipping Rules'}
              </button>
            </form>
          </div>

          {/* PAYMENT METHODS */}
          <div className="admin-card" style={{ padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: '#FDF8F6', color: 'var(--color-burgundy)', borderRadius: '12px' }}>
                <IconCreditCard />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Payment Methods</h2>
            </div>

            <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Custom Toggle Switch UI */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#FAFAFA', borderRadius: '12px', border: '1px solid var(--color-gray-200)', cursor: 'pointer' }}>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, color: '#111' }}>Cash on Delivery (COD)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '2px', display: 'block' }}>
                    Allow customers to pay upon receipt of their order.
                  </span>
                </div>
                
                {/* CSS Toggle Switch */}
                <div style={{ position: 'relative', width: '48px', height: '26px' }}>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: codEnabled ? 'var(--color-burgundy)' : '#ccc',
                    borderRadius: '34px', transition: '.3s',
                  }}>
                    <span style={{
                      position: 'absolute', height: '18px', width: '18px', left: '4px', bottom: '4px',
                      backgroundColor: 'white', borderRadius: '50%', transition: '.3s',
                      transform: codEnabled ? 'translateX(22px)' : 'translateX(0)'
                    }} />
                  </span>
                </div>
              </label>

              {paymentMessage && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', 
                  backgroundColor: paymentMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: paymentMessage.type === 'success' ? '#065F46' : '#991B1B'
                }}>
                  {paymentMessage.text}
                </div>
              )}

              <button type="submit" className="btn btn-outline" disabled={savingPayment} style={{ width: '100%', justifyContent: 'center' }}>
                {savingPayment ? 'Saving...' : 'Save Payment Preferences'}
              </button>
            </form>
          </div>

          {/* WHATSAPP CONFIG */}
          <div className="admin-card" style={{ padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: '#F0FFF4', color: '#25D366', borderRadius: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L0 24l6.335-1.497A11.923 11.923 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.727.88.934-3.618-.234-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>WhatsApp Configuration</h2>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSavingWhatsApp(true);
              setWaMessage(null);
              try {
                const res = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ key: 'whatsapp', value: { admin_phone: waPhone, default_message: waDefaultMsg } }),
                });
                if (!res.ok) throw new Error('Failed to save');
                setWaMessage({ text: 'WhatsApp config saved!', type: 'success' });
              } catch (err: any) {
                setWaMessage({ text: err.message, type: 'error' });
              } finally {
                setSavingWhatsApp(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Admin Phone Number</label>
                <input type="text" required className="input" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="e.g. 919209337387" />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
                  Country code + number, no spaces or +. This is where all order notifications go.
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Default Greeting Message</label>
                <input type="text" required className="input" value={waDefaultMsg} onChange={(e) => setWaDefaultMsg(e.target.value)} placeholder="Hi! I would like to know about your sarees" />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
                  Default message shown in the floating WhatsApp chat widget.
                </p>
              </div>

              {waMessage && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem',
                  backgroundColor: waMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: waMessage.type === 'success' ? '#065F46' : '#991B1B'
                }}>
                  {waMessage.text}
                </div>
              )}

              <button type="submit" className="btn btn-outline" disabled={savingWhatsApp} style={{ width: '100%', justifyContent: 'center' }}>
                {savingWhatsApp ? 'Saving...' : 'Save WhatsApp Settings'}
              </button>
            </form>
          </div>
          
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
