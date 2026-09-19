'use client';

import React from 'react';

interface FloatingWhatsAppProps {
  phone: string; // e.g. "919876543210"
  message?: string;
}

export default function FloatingWhatsApp({ phone, message = 'Hi! I have a question about your sarees 🌸' }: FloatingWhatsAppProps) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
        id="whatsapp-fab"
      >
        {/* WhatsApp SVG icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L0 24l6.335-1.497A11.923 11.923 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.727.88.934-3.618-.234-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
        </svg>
        <span className="whatsapp-fab-pulse" aria-hidden="true" />
      </a>

      <style>{`
        .whatsapp-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #25D366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }
        .whatsapp-fab:hover {
          transform: scale(1.12) translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.55);
        }

        /* Pulse ring animation */
        .whatsapp-fab-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(37,211,102,0.5);
          animation: wa-pulse 2s ease-out infinite;
        }
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* On mobile — lift above browser bottom nav */
        @media (max-width: 768px) {
          .whatsapp-fab { bottom: 80px; right: 16px; width: 52px; height: 52px; }
        }
      `}</style>
    </>
  );
}
