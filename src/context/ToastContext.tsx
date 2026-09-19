'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type} animate-slide-in-right`}>
            {t.type === 'success' && '✅ '}
            {t.type === 'error' && '❌ '}
            {t.type === 'info' && 'ℹ️ '}
            {t.message}
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          top: var(--space-4);
          right: var(--space-4);
          z-index: var(--z-toast);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          pointer-events: none;
        }
        .toast-item {
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          color: white;
          box-shadow: var(--shadow-lg);
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .toast-success { background: var(--color-success); }
        .toast-error { background: var(--color-error); }
        .toast-info { background: var(--color-info); }
        
        .animate-slide-in-right {
          animation: slideInRight var(--transition-normal) forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
