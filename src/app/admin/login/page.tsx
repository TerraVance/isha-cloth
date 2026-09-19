'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in-up">
        <div className="login-logo-wrap">
          <Image src="/images/logo.png" alt="Isha Vastram" width={160} height={64} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="login-title">Admin Portal</h1>
        <p className="login-subtitle">Enter your admin password to continue</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`input${error ? ' error' : ''}`}
              placeholder="Enter admin password"
              autoFocus
              required
            />
            {error && <span className="input-error-msg">{error}</span>}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg login-btn"
            disabled={loading}
            id="admin-login-btn"
          >
            {loading ? <><span className="spinner" /> Signing in…</> : '🔐 Sign In'}
          </button>
        </form>

        <a href="/" className="login-back">← Back to Store</a>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0F172A, #1E293B, #0F172A);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .login-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,165,55,0.2);
          border-radius: var(--radius-2xl);
          padding: var(--space-12);
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        .login-logo-wrap {
          display: flex; justify-content: center;
          margin-bottom: var(--space-6);
          filter: brightness(0) invert(1);
        }

        .login-title {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          color: var(--color-gold-light);
          margin-bottom: var(--space-2);
        }

        .login-subtitle {
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.5);
          margin-bottom: var(--space-8);
        }

        .login-form { display: flex; flex-direction: column; gap: var(--space-5); text-align: left; }
        .login-form .input-label { color: rgba(255,255,255,0.7); }
        .login-form .input {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: white;
        }
        .login-form .input:focus { border-color: var(--color-gold); box-shadow: 0 0 0 3px rgba(212,165,55,0.15); }
        .login-form .input::placeholder { color: rgba(255,255,255,0.3); }

        .login-btn { width: 100%; justify-content: center; margin-top: var(--space-2); }

        .login-back {
          display: block;
          margin-top: var(--space-6);
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .login-back:hover { color: var(--color-gold-light); }
      `}</style>
    </div>
  );
}
