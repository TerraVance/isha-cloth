'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Products', icon: '🌸' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/testimonials', label: 'Reviews', icon: '⭐' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/finance', label: 'Finance', icon: '💰' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
        <div className="sidebar-logo">
          <Link href="/" target="_blank" rel="noopener" aria-label="View store">
            <Image src="/images/logo.png" alt="Isha Vastram" width={120} height={48} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          </Link>
          <span className="sidebar-admin-badge">Admin</span>
        </div>

        <nav>
          <ul role="list" style={{ marginTop: 'var(--space-4)' }}>
            {NAV_ITEMS.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`admin-nav-item${isActive(item.href, item.exact) ? ' active' : ''}`}
                  id={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          <Link href="/" target="_blank" className="admin-nav-item sidebar-store-link">
            <span aria-hidden="true">🌐</span>
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-item sidebar-logout"
            disabled={loggingOut}
            id="admin-logout"
          >
            <span aria-hidden="true">🚪</span>
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* C7: Mobile Bottom Tab Bar */}
      <nav className="admin-bottom-tab-bar" aria-label="Admin mobile navigation">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-tab-item${isActive(item.href, item.exact) ? ' active' : ''}`}
            aria-label={item.label}
            id={`admin-tab-${item.label.toLowerCase()}`}
          >
            <span className="admin-tab-icon" aria-hidden="true">{item.icon}</span>
            <span className="admin-tab-label">{item.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="admin-tab-item" disabled={loggingOut} aria-label="Logout">
          <span className="admin-tab-icon" aria-hidden="true">🚪</span>
          <span className="admin-tab-label">Logout</span>
        </button>
      </nav>

      <style>{`
        .sidebar-logo {
          padding: 0 var(--space-6) var(--space-6);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .sidebar-admin-badge {
          font-size: var(--text-xs);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-gold);
          font-weight: 600;
        }
        .sidebar-bottom {
          margin-top: auto;
          padding-top: var(--space-4);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-store-link { color: var(--color-gray-400) !important; }
        .sidebar-logout {
          width: 100%;
          text-align: left;
          color: rgba(220,38,38,0.8) !important;
        }
        .sidebar-logout:hover { color: var(--color-error) !important; background: rgba(220,38,38,0.08) !important; }

        /* C7: Mobile bottom tab bar hidden by default on desktop */
        .admin-bottom-tab-bar { display: none; }

        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }

          .admin-bottom-tab-bar {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 200;
            background: var(--color-charcoal);
            border-top: 1px solid rgba(255,255,255,0.08);
            padding: var(--space-1) 0;
            padding-bottom: env(safe-area-inset-bottom, var(--space-1));
          }

          .admin-tab-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            padding: var(--space-2) var(--space-1);
            color: rgba(255,255,255,0.4);
            text-decoration: none;
            font-size: var(--text-xs);
            border: none;
            background: none;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .admin-tab-item.active,
          .admin-tab-item:hover { color: var(--color-gold); }
          .admin-tab-icon { font-size: 1.25rem; line-height: 1; }
          .admin-tab-label { font-size: 9px; letter-spacing: 0.03em; font-weight: 500; }
          .admin-main { padding-bottom: 70px !important; }
        }
      `}</style>
    </>
  );
}
