'use client';

import React, { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
  errorMessage?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
  errorMessage,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={!isDeleting ? onCancel : undefined}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1000,
          backdropFilter: 'blur(3px)',
          animation: 'modal-fade-in 0.15s ease',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          animation: 'modal-slide-in 0.2s ease',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
          marginBottom: '1.25rem',
        }}>
          🗑️
        </div>

        {/* Title */}
        <h2
          id="delete-modal-title"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)',
            color: '#111',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: itemName ? '0.75rem' : '1.5rem' }}>
          {message}
        </p>

        {/* Highlighted item name */}
        {itemName && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            marginBottom: '1.5rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            color: '#991B1B',
          }}>
            {itemName}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            fontSize: 'var(--text-sm)',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--color-gray-300)',
              background: 'white',
              color: 'var(--color-gray-600)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: isDeleting ? '#FCA5A5' : '#DC2626',
              color: 'white',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.15s',
            }}
          >
            {isDeleting ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Deleting…
              </>
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-slide-in {
          from { opacity: 0; transform: translate(-50%, -52%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
