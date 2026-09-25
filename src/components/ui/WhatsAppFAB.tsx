'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WHATSAPP_QUICK_REPLIES } from '@/lib/whatsapp';

interface WhatsAppConfig {
  admin_phone: string;
  default_message: string;
}

export default function WhatsAppFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfig>({
    admin_phone: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919209337387',
    default_message: 'Hi! I would like to know about your sarees 🌸',
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch WhatsApp config from DB
  useEffect(() => {
    fetch('/api/settings?key=whatsapp')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setConfig(prev => ({
            admin_phone: json.data.admin_phone || prev.admin_phone,
            default_message: json.data.default_message || prev.default_message,
          }));
        }
      })
      .catch(console.error);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${config.admin_phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div ref={panelRef} className="wa-widget" id="whatsapp-widget">
      {/* Chat Panel */}
      {isOpen && (
        <div className="wa-panel">
          {/* Header */}
          <div className="wa-panel-header">
            <div className="wa-panel-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L0 24l6.335-1.497A11.923 11.923 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.727.88.934-3.618-.234-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
              </svg>
            </div>
            <div>
              <div className="wa-panel-name">Isha Vastram</div>
              <div className="wa-panel-status">
                <span className="wa-status-dot" />
                Typically replies instantly
              </div>
            </div>
            <button className="wa-panel-close" onClick={() => setIsOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="wa-panel-body">
            <div className="wa-bubble">
              <p>Hi there! 👋🌸</p>
              <p>How can we help you today?</p>
            </div>
          </div>

          {/* Quick Reply Buttons */}
          <div className="wa-panel-actions">
            {WHATSAPP_QUICK_REPLIES.map((q, i) => (
              <button
                key={i}
                className="wa-quick-btn"
                onClick={() => openWhatsApp(q.message)}
              >
                <span>{q.emoji}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        className="wa-fab"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
        <span className="wa-fab-pulse" aria-hidden="true" />
      </button>

      <style>{`
        .wa-widget {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── FAB Button ── */
        .wa-fab {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #25D366;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .wa-fab:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.55);
        }

        .wa-fab-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(37,211,102,0.5);
          animation: wa-pulse 2s ease-out infinite;
          pointer-events: none;
        }
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* ── Chat Panel ── */
        .wa-panel {
          position: absolute;
          bottom: 76px;
          right: 0;
          width: 360px;
          max-height: 520px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08);
          animation: wa-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          background: #F0F2F5;
        }
        @keyframes wa-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .wa-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #075E54;
          color: white;
        }
        .wa-panel-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .wa-panel-name {
          font-weight: 600;
          font-size: 15px;
        }
        .wa-panel-status {
          font-size: 12px;
          opacity: 0.85;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wa-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #25D366;
          display: inline-block;
        }
        .wa-panel-close {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .wa-panel-close:hover { opacity: 1; }

        /* ── Chat Body ── */
        .wa-panel-body {
          padding: 20px 16px;
          background: #E5DDD5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Crect width='40' height='40' fill='%23E5DDD5'/%3E%3Ccircle cx='20' cy='20' r='1' fill='%23d6cfc3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23p)'/%3E%3C/svg%3E");
        }
        .wa-bubble {
          background: white;
          border-radius: 0 12px 12px 12px;
          padding: 12px 16px;
          max-width: 85%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          font-size: 14px;
          line-height: 1.5;
          color: #303030;
        }
        .wa-bubble p { margin: 0; }
        .wa-bubble p + p { margin-top: 4px; }

        /* ── Quick Reply Buttons ── */
        .wa-panel-actions {
          padding: 12px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: white;
          border-top: 1px solid #E5E7EB;
        }
        .wa-quick-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          color: #303030;
          transition: all 0.2s ease;
          text-align: left;
        }
        .wa-quick-btn:hover {
          background: #F0FFF4;
          border-color: #25D366;
          transform: translateX(4px);
        }
        .wa-quick-btn span:first-child {
          font-size: 18px;
          flex-shrink: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .wa-widget { bottom: 16px; right: 16px; }
          .wa-fab { width: 52px; height: 52px; }
          .wa-panel {
            width: calc(100vw - 32px);
            right: 0;
            bottom: 68px;
            max-height: 75vh;
          }
        }
      `}</style>
    </div>
  );
}
