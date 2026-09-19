'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }} aria-hidden="true">⚠️</div>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2rem',
          color: '#4A0E1B',
          marginBottom: '0.75rem',
        }}>
          Something Went Wrong
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#737373',
          lineHeight: 1.7,
          marginBottom: '1.5rem',
        }}>
          We hit an unexpected error. Don&apos;t worry — your cart is safe. Please try again.
        </p>
        {error.message && process.env.NODE_ENV === 'development' && (
          <pre style={{
            background: '#F5F5F5',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#DC2626',
            textAlign: 'left',
            overflow: 'auto',
            marginBottom: '1.5rem',
            maxHeight: 120,
          }}>
            {error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              background: '#800020',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            id="error-retry"
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              border: '2px solid #D4D4D4',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#404040',
              textDecoration: 'none',
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
